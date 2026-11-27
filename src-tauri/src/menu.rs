// The native menu, laid out to each platform's conventions. The web app owns
// the screens, so picking one sends it an event, and it tells us which items
// to disable.
use tauri::menu::{
  HELP_SUBMENU_ID, Menu, MenuItem, PredefinedMenuItem, Submenu, WINDOW_SUBMENU_ID,
};
use tauri::{AppHandle, Emitter, Manager, State, Wry};
use tauri_plugin_opener::OpenerExt;

// the item ids, also sent to the web app (see utils/menu.js)
const DASHBOARD: &str = "dashboard";
const SETTINGS: &str = "settings";
const ABOUT: &str = "about";
const FULLSCREEN: &str = "fullscreen";
const QUIT: &str = "quit";
const HELP: &str = "help";
const ISSUES: &str = "issues";

const APP_NAME: &str = "QSA Dashboard";
const HELP_URL: &str = "https://github.com/mikechambers/qsa-dashboard-js#readme";
const ISSUES_URL: &str = "https://github.com/mikechambers/qsa-dashboard-js/issues";

const NAVIGATE_EVENT: &str = "menu-navigate";

pub struct NavItems {
  dashboard: MenuItem<Wry>,
  settings: MenuItem<Wry>,
  about: MenuItem<Wry>,
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
  let mac = cfg!(target_os = "macos");

  // mac marks items that need more input with an ellipsis. The & marks the Alt
  // key letter on windows and linux, and is removed on mac
  let settings_text = if mac { "Settings…" } else { "&Settings" };

  let items = NavItems {
    dashboard: item(app, DASHBOARD, "&Dashboard", Some("CmdOrCtrl+D"))?,
    settings: item(app, SETTINGS, settings_text, Some("CmdOrCtrl+,"))?,
    about: item(app, ABOUT, &format!("About {APP_NAME}"), None)?,
  };

  let menu = if mac {
    mac_menu(app, &items)?
  } else {
    window_menu_bar(app, &items)?
  };

  app.set_menu(menu)?;
  app.manage(items);

  app.on_menu_event(|app, event| {
    let id = event.id().as_ref();
    if [DASHBOARD, SETTINGS, ABOUT].contains(&id) {
      if let Err(error) = app.emit(NAVIGATE_EVENT, id) {
        log::error!("could not send menu event: {error}");
      }
    } else if id == FULLSCREEN {
      if let Err(error) = toggle_fullscreen(app) {
        log::error!("could not toggle full screen: {error}");
      }
    } else if id == QUIT {
      app.exit(0);
    } else if id == HELP {
      open_link(app, HELP_URL);
    } else if id == ISSUES {
      open_link(app, ISSUES_URL);
    }
  });

  Ok(())
}

fn toggle_fullscreen(app: &AppHandle) -> tauri::Result<()> {
  if let Some(window) = app.get_webview_window("main") {
    window.set_fullscreen(!window.is_fullscreen()?)?;
  }
  Ok(())
}

// opens in the system browser
fn open_link(app: &AppHandle, url: &str) {
  if let Err(error) = app.opener().open_url(url, None::<&str>) {
    log::error!("could not open {url}: {error}");
  }
}

fn item(app: &AppHandle, id: &str, text: &str, keys: Option<&str>) -> tauri::Result<MenuItem<Wry>> {
  MenuItem::with_id(app, id, text, true, keys)
}

// built in full, rather than from Menu::default, which names Hide and Quit
// after the bundle, has no Show All and lists Close Window twice
fn mac_menu(app: &AppHandle, items: &NavItems) -> tauri::Result<Menu<Wry>> {
  let app_menu = Submenu::with_items(
    app,
    APP_NAME,
    true,
    &[
      &items.about,
      &PredefinedMenuItem::separator(app)?,
      &items.settings,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::services(app, None)?,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::hide(app, Some(&format!("Hide {APP_NAME}")))?,
      &PredefinedMenuItem::hide_others(app, None)?,
      &PredefinedMenuItem::show_all(app, None)?,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::quit(app, Some(&format!("Quit {APP_NAME}")))?,
    ],
  )?;

  let file = Submenu::with_items(
    app,
    "File",
    true,
    &[&PredefinedMenuItem::close_window(app, None)?],
  )?;

  // needed for copy and paste to work
  let edit = Submenu::with_items(
    app,
    "Edit",
    true,
    &[
      &PredefinedMenuItem::undo(app, None)?,
      &PredefinedMenuItem::redo(app, None)?,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::cut(app, None)?,
      &PredefinedMenuItem::copy(app, None)?,
      &PredefinedMenuItem::paste(app, None)?,
      &PredefinedMenuItem::select_all(app, None)?,
    ],
  )?;

  let view = Submenu::with_items(
    app,
    "View",
    true,
    &[
      &items.dashboard,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::fullscreen(app, None)?,
    ],
  )?;

  // the ids let mac add its own items to these two
  let window = Submenu::with_id_and_items(
    app,
    WINDOW_SUBMENU_ID,
    "Window",
    true,
    &[
      &PredefinedMenuItem::minimize(app, None)?,
      &PredefinedMenuItem::maximize(app, None)?,
    ],
  )?;

  let help = Submenu::with_id_and_items(
    app,
    HELP_SUBMENU_ID,
    "Help",
    true,
    &[
      &item(app, HELP, &format!("{APP_NAME} Help"), None)?,
      &item(app, ISSUES, "Report an Issue", None)?,
    ],
  )?;

  Menu::with_items(app, &[&app_menu, &file, &edit, &view, &window, &help])
}

// windows and linux
fn window_menu_bar(app: &AppHandle, items: &NavItems) -> tauri::Result<Menu<Wry>> {
  // windows calls it Exit, and already closes with Alt+F4. The built in quit
  // item doesn't work on linux, so both use our own
  let (quit_text, quit_keys) = if cfg!(windows) {
    ("E&xit", None)
  } else {
    ("&Quit", Some("Ctrl+Q"))
  };

  let file = Submenu::with_items(
    app,
    "&File",
    true,
    &[
      &items.settings,
      &PredefinedMenuItem::separator(app)?,
      &item(app, QUIT, quit_text, quit_keys)?,
    ],
  )?;

  // the standard full screen item only exists on mac
  let view = Submenu::with_items(
    app,
    "&View",
    true,
    &[
      &items.dashboard,
      &PredefinedMenuItem::separator(app)?,
      &item(app, FULLSCREEN, "&Full Screen", Some("F11"))?,
    ],
  )?;

  let help = Submenu::with_items(
    app,
    "&Help",
    true,
    &[
      &item(app, HELP, &format!("{APP_NAME} &Help"), None)?,
      &item(app, ISSUES, "&Report an Issue", None)?,
      &PredefinedMenuItem::separator(app)?,
      &items.about,
    ],
  )?;

  Menu::with_items(app, &[&file, &view, &help])
}

// which items can be picked
#[tauri::command]
pub fn set_menu_state(
  items: State<NavItems>,
  dashboard: bool,
  settings: bool,
  about: bool,
) -> tauri::Result<()> {
  items.dashboard.set_enabled(dashboard)?;
  items.settings.set_enabled(settings)?;
  items.about.set_enabled(about)
}
