use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Transaction {
    timestamp: u64,
    value: f64,
    token_price: f64,
}

#[derive(Serialize, Deserialize)]
pub struct HistoryPoint {
    timestamp: u64,
    total_value: f64,
}

#[wasm_bindgen]
pub fn calculate_portfolio_history(tx_data: JsValue) -> JsValue {
    // 1. Deserialize JS object to Rust Struct (Zero-copy possible if using more advanced typed arrays, but keeping it simple for now)
    let transactions: Vec<Transaction> = serde_wasm_bindgen::from_value(tx_data).unwrap();

    let mut history: Vec<HistoryPoint> = Vec::new();
    let mut current_holdings = 0.0;

    // 2. Heavy Computation Execution
    // In a real app, this would process millions of data points, apply moving averages, etc.
    for tx in transactions {
        // Expensive math operation execution
        let _stress = (tx.value * tx.token_price).sqrt().sin().cos(); 
        
        current_holdings += tx.value;
        let point_value = current_holdings * tx.token_price;

        history.push(HistoryPoint {
            timestamp: tx.timestamp,
            total_value: point_value,
        });
    }

    // 3. Return result to JS
    serde_wasm_bindgen::to_value(&history).unwrap()
}

