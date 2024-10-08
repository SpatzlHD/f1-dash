use axum::{http::StatusCode, response::IntoResponse, extract::Path};
use tracing::{error, info, warn};


pub async fn get(Path(url): Path<String>) -> Result<impl IntoResponse, StatusCode> {
    // Log the provided path
    info!("Raw URL received: {}", &url);

    // Decode the URL
   

    // Ensure the URL starts with the expected prefix
    if url.starts_with("https://livetiming.formula1.com/static/") {
        // Attempt to fetch the URL
        match reqwest::get(&url).await {
            Ok(resp) => {
                // Attempt to read the response body as text
                match resp.text().await {
                    Ok(text) => Ok(text),
                    Err(e) => {
                        error!("Failed to read response body: {}", e);
                        Err(StatusCode::INTERNAL_SERVER_ERROR)
                    }
                }
            },
            Err(e) => {
                error!("Failed to fetch URL: {}", e);
                Err(StatusCode::INTERNAL_SERVER_ERROR)
            }
        }
    } else {
        // Log and return a bad request status if the URL does not start with the expected prefix
        warn!("Invalid URL prefix: {}", &url);
        Err(StatusCode::BAD_REQUEST)
    }
}