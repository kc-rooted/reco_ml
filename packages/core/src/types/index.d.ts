export interface TrainingRecord {
    record_id: number;
    record_type: string;
    swing_speed: string;
    current_shot_shape: string;
    shot_shape_slider: number;
    current_trajectory: string;
    trajectory_slider: number;
    feel_slider: number;
    recommended_shaft_1: string;
    success_probability_1: number;
    recommended_shaft_2: string;
    success_probability_2: number;
    color_series: string;
    is_conflict: boolean;
}
export interface UserAnswers {
    swing_speed: string;
    current_shot_shape: string;
    shot_shape_slider: number;
    trajectory_slider: number;
    feel_slider: number;
}
export interface ShaftRecommendation {
    index: number;
    name: string;
    probability: number;
    percentage: number;
}
export interface ModelConfig {
    inputFeatures: number;
    hiddenUnits: number[];
    outputUnits: number;
    dropoutRate: number;
    learningRate: number;
}
export interface TrainingConfig {
    epochs: number;
    batchSize: number;
    validationSplit: number;
    patience: number;
}
//# sourceMappingURL=index.d.ts.map