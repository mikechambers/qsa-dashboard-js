// The native menu items for moving between screens. The web app owns the
// screens, so picking an item sends it an event, and it tells us which items
// to disable.
use tauri::menu::{Menu, MenuItem, MenuItemKind, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, State, Wry};

// the item ids, also sent to the web app (see utils/menu.js)
const DASHBOARD: &str = "dashboard";
const SETTINGS: &str = "settings";
const ABOUT: &str = "about";
const FULLSCREEN: &str = "fullscreen";

const NAVIGATE_EVENT: &str = "menu-navigate";

pub struct NavItems {
  dashboard: MenuItem<Wry>,
  settings: MenuItem<Wry>,
  about: MenuItem<Wry>,
}

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
  let item = |id: &str, text: &str, keys: Option<&str>| {
    MenuItem::with_id(app, id, text, true, keys)
  };

  let about_text = if cfg!(target_os = "macos") {
    "About QSA Dashboard"
  } else {
    "About"
  };

  let items = NavItems {
    dashboard: item(DASHBOARD, "Dashboard", Some("CmdOrCtrl+D"))?,
    settings: item(SETTINGS, "Settings", Some("CmdOrCtrl+,"))?,
    about: item(ABOUT, about_text, None)?,
  };

  let menu = if cfg!(target_os = "macos") {
    mac_menu(app, &items)?
  } else {
    // other platforms have no menu by default, so just add ours. The
    // standard full screen item only exists on mac, so these need their own
    let view = Submenu::with_items(
      app,
      "View",
      true,
      &[
        &items.dashboard,
        &items.settings,
        &items.about,
        &PredefinedMenuItem::separator(app)?,
        &item(FULLSCREEN, "Toggle Full Screen", Some("F11"))?,
      ],
    )?;
    Menu::with_items(app, &[&view])?
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

// the standard mac menu (which has full screen in its View menu), with About and Settings in the app menu, and
// Dashboard in the View menu
fn mac_menu(app: &AppHandle, items: &NavItems) -> tauri::Result<Menu<Wry>> {
  let menu = Menu::default(app)?;
  let submenus: Vec<_> = menu
    .items()?
    .iter()
    .filter_map(MenuItemKind::as_submenu)
    .cloned()
    .collect();

  // the app menu is always first, and starts with the standard About panel,
  // which ours replaces
  if let Some(app_menu) = submenus.first() {
    app_menu.remove_at(0)?;
    app_menu.insert_items(
      &[
        &items.about,
        &PredefinedMenuItem::separator(app)?,
        &items.settings,
      ],
      0,
    )?;
  }

  let view = submenus
    .iter()
    .find(|menu| menu.text().is_ok_and(|text| text == "View"));

  if let Some(view) = view {
    view.insert_items(
      &[&items.dashboard, &PredefinedMenuItem::separator(app)?],
      0,
    )?;
  }

  Ok(menu)
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
