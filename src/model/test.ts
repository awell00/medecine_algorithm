// Import required libraries
// import * as fs from "fs";
// import * as tf from "@tensorflow/tfjs-node";
//
// // Load and preprocess data from JSON file
// const loadData = () => {
// 	const rawData = fs.readFileSync("data.json", "utf8");
// 	const data = JSON.parse(rawData);
//
// 	const features = data.features.map((item: number[]) => tf.tensor(item));
// 	const labels = tf.tensor(data.labels);
//
// 	return { features, labels };
// };
//
// // Build a simple model
// const buildModel = () => {
// 	const model = tf.sequential();
// 	model.add(tf.layers.dense({ units: 10, inputShape: [data.features[0].shape[0]], activation: "relu" }));
// 	model.add(tf.layers.dense({ units: 1, activation: "linear" }));
//
// 	model.compile({ optimizer: "adam", loss: "meanSquaredError" });
//
// 	return model;
// };
//
// // Load and preprocess data
// const data = loadData();
//
// // Build the model
// const model = buildModel();
//
// // Train the model
// model.fit(data.features, data.labels, { epochs: 50 }).then(() => {
// 	console.log("Model training completed.");
//
// 	// Make predictions
// 	const newFeatures = tf.tensor([
// 		[0.2, 0.4, 0.6]
//
// 	]);
//
// 	// Reshape newFeatures to match the input shape
// 	const reshapedFeatures = newFeatures.reshape([newFeatures.shape[0], data.features[0].shape[0]]);
//
// 	const predictions = model.predict(reshapedFeatures) as tf.Tensor;
// 	predictions.print();
// });
//
// import joblib from "./joblib";
// import * as tf from "@tensorflow/tfjs-node"; // Import TensorFlow
// import * as sk from "scikitjs";
//
// const model = joblib.load("your_model.pkl");
// // Set the TensorFlow backend
// sk.setBackend(tf);
//
// const X_new = [
// 	[0.1, 0.9],
// 	[0.01, 0.99]
// ];
//
// const predictions = model.predict(X_new);
//
// console.log(predictions);

