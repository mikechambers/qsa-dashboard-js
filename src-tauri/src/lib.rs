mod wsjtx;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(wsjtx::Connection::default())
    // opens links to other sites in the system browser
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![wsjtx::listener::wsjtx_reply])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      wsjtx::start(app.handle().clone());
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
