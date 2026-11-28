mod menu;
mod wsjtx;

use tauri_plugin_prevent_default::Flags;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  // stops the webview acting like a browser: no find, print or reload keys.
  // Left off in dev, where those are useful. It has to be added here, before the
  // window is created, for its script to load
  if !cfg!(debug_assertions) {
    // the right click menu is handled in utils/contextMenu.js, which can leave
    // it on for text fields. Shift+Tab is left alone, to move back a field
    let flags = Flags::all().difference(Flags::CONTEXT_MENU | Flags::FOCUS_MOVE);
    builder = builder.plugin(tauri_plugin_prevent_default::with_flags(flags));
  }

  builder
    .manage(wsjtx::Connection::default())
    // opens links to other sites in the system browser
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      menu::set_menu_state,
      wsjtx::listener::wsjtx_reply,
      wsjtx::listener::wsjtx_configure
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      menu::setup(app.handle())?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
