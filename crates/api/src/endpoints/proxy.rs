use axum::{http::StatusCode, response::IntoResponse, extract::Path};

pub async fn get(Path(url): Path<String>) -> Result<impl IntoResponse, StatusCode> {
    //get the provided path and log it
    
    if url.starts_with("https://livetiming.formula1.com/static/") {
        let resp = match reqwest::get(&url).await {
            Ok(resp) => resp.text().await.unwrap(),
            Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
        };
        
        Ok(resp)
    } else {
        Err(StatusCode::BAD_REQUEST)
    }
}
