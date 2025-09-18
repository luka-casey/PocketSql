use tauri_plugin_http;
use tauri_plugin_dialog;


  // src/main.rs
  #[tauri::command]
  fn greet(name: String) -> String {
    format!("Hello, {}!", name)
  }


fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
