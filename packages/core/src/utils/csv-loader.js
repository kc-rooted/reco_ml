"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCSVData = loadCSVData;
exports.validateTrainingData = validateTrainingData;
const fs = __importStar(require("fs"));
const Papa = __importStar(require("papaparse"));
function loadCSVData(filePath) {
    try {
        const csvContent = fs.readFileSync(filePath, 'utf8');
        const parseResult = Papa.parse(csvContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        if (parseResult.errors.length > 0) {
            console.error('CSV parsing errors:', parseResult.errors);
        }
        console.log(`📁 Loaded ${parseResult.data.length} records from ${filePath}`);
        return parseResult.data;
    }
    catch (error) {
        console.error(`Failed to load CSV file: ${filePath}`, error);
        throw error;
    }
}
function validateTrainingData(data) {
    if (data.length === 0) {
        console.error('No training data found');
        return false;
    }
    const requiredFields = [
        'swing_speed',
        'current_shot_shape',
        'shot_shape_slider',
        'trajectory_slider',
        'feel_slider',
        'recommended_shaft_1',
        'recommended_shaft_2'
    ];
    const invalidRecords = data.filter((record, index) => {
        const missingFields = requiredFields.filter(field => record[field] === undefined ||
            record[field] === null);
        if (missingFields.length > 0) {
            console.error(`Record ${index} missing fields:`, missingFields);
            return true;
        }
        return false;
    });
    if (invalidRecords.length > 0) {
        console.error(`Found ${invalidRecords.length} invalid records`);
        return false;
    }
    return true;
}
//# sourceMappingURL=csv-loader.js.map