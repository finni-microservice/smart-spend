/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/config/env.config.ts":
/*!***********************************!*\
  !*** ./apps/config/env.config.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigOptions = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const Joi = __webpack_require__(/*! joi */ "joi");
exports["default"] = (0, config_1.registerAs)('env', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
    axiomToken: process.env.AXIOM_TOKEN,
    axiomOrgId: process.env.AXIOM_ORG_ID,
    axiomDataset: process.env.AXIOM_DATASET || '',
}));
exports.ConfigOptions = {
    isGlobal: true,
    envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    validationSchema: Joi.object({
        NODE_ENV: Joi.string()
            .valid('development', 'production', 'staging', 'local')
            .default('development'),
        PORT: Joi.number().default(3000),
        MONGO_URI: Joi.string().required(),
        MONGO_DB_NAME: Joi.string().required(),
        APP_NAME: Joi.string(),
        INJECT_CID: Joi.boolean().default(false),
        LOGGER_MIN_LEVEL: Joi.string().default('debug'),
        LOGGER_DISABLE: Joi.boolean().default(false),
    }),
};


/***/ }),

/***/ "./apps/config/logger.config.ts":
/*!**************************************!*\
  !*** ./apps/config/logger.config.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LOGGER_CONFIG_KEY = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const winston_1 = __webpack_require__(/*! winston */ "winston");
const winston_2 = __webpack_require__(/*! @axiomhq/winston */ "@axiomhq/winston");
exports.LOGGER_CONFIG_KEY = 'logger-config';
exports["default"] = (0, config_1.registerAs)(exports.LOGGER_CONFIG_KEY, () => {
    let logFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json());
    const defaultMeta = {
        layer: 'App',
        app: process.env.APP_NAME,
        context: 'unspecified',
        type: 'LOG',
    };
    switch (process.env.NODE_ENV) {
        case 'production':
            logFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json(), winston_1.format.prettyPrint());
            break;
        default:
            logFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.json(), winston_1.format.prettyPrint());
            break;
    }
    const winstonTransports = [];
    if (process.env.NODE_ENV === 'production') {
        winstonTransports.push(new winston_2.WinstonTransport({
            dataset: process.env.AXIOM_DATASET,
            token: process.env.AXIOM_TOKEN,
        }));
    }
    else {
        winstonTransports.push(new winston_1.transports.Console());
    }
    return {
        winston: {
            level: process.env.LOGGER_MIN_LEVEL || 'debug',
            silent: process.env.LOGGER_DISABLE === 'true',
            transports: winstonTransports,
            format: logFormat,
            defaultMeta,
        },
    };
});


/***/ }),

/***/ "./apps/factories/app.logger.ts":
/*!**************************************!*\
  !*** ./apps/factories/app.logger.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.appLoggerFactory = exports.APP_LOGGER = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const logger_config_1 = __webpack_require__(/*! apps/config/logger.config */ "./apps/config/logger.config.ts");
const winston = __webpack_require__(/*! winston */ "winston");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const messageFormatter_1 = __webpack_require__(/*! apps/utils/messageFormatter */ "./apps/utils/messageFormatter.ts");
exports.APP_LOGGER = 'app-logger';
exports.appLoggerFactory = {
    provide: exports.APP_LOGGER,
    useFactory: (configService, parentClass) => {
        const config = configService.get(logger_config_1.LOGGER_CONFIG_KEY);
        if (!config) {
            throw new Error('Logger configuration is not defined');
        }
        return winston.createLogger({
            ...config.winston,
            format: winston.format.combine(config.winston.format, (0, messageFormatter_1.formatAppLogMessage)()),
            defaultMeta: {
                ...config.winston.defaultMeta,
                context: parentClass?.constructor?.name,
            },
        });
    },
    scope: common_1.Scope.TRANSIENT,
    inject: [config_1.ConfigService, core_1.INQUIRER],
};


/***/ }),

/***/ "./apps/factories/request.Context.logger.ts":
/*!**************************************************!*\
  !*** ./apps/factories/request.Context.logger.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.reqCtxLoggerFactory = exports.REQ_CTX_LOGGER = void 0;
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const logger_config_1 = __webpack_require__(/*! ../config/logger.config */ "./apps/config/logger.config.ts");
const winston = __webpack_require__(/*! winston */ "winston");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const messageFormatter_1 = __webpack_require__(/*! ../utils/messageFormatter */ "./apps/utils/messageFormatter.ts");
const requestContext_service_1 = __webpack_require__(/*! apps/request/requestContext.service */ "./apps/request/requestContext.service.ts");
exports.REQ_CTX_LOGGER = 'req-ctx-logger';
exports.reqCtxLoggerFactory = {
    provide: exports.REQ_CTX_LOGGER,
    useFactory: (configService, reqService, parentClass) => {
        const config = configService.get(logger_config_1.LOGGER_CONFIG_KEY);
        if (!config) {
            throw new Error('Logger configuration is not defined');
        }
        return winston.createLogger({
            ...config.winston,
            format: winston.format.combine(config.winston.format, (0, messageFormatter_1.formatReqLogMessage)()),
            defaultMeta: {
                ...config.winston.defaultMeta,
                type: 'REQ',
                cid: reqService.getCID() || 'N/A',
                route: reqService.getRoute(),
                context: parentClass.constructor.name,
            },
        });
    },
    scope: common_1.Scope.TRANSIENT,
    inject: [config_1.ConfigService, requestContext_service_1.RequestContextService, core_1.INQUIRER, core_1.REQUEST],
};


/***/ }),

/***/ "./apps/libs/langchain/langchain.service.ts":
/*!**************************************************!*\
  !*** ./apps/libs/langchain/langchain.service.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LangChainService = void 0;
const groq_1 = __webpack_require__(/*! @langchain/groq */ "@langchain/groq");
const prompts_1 = __webpack_require__(/*! @langchain/core/prompts */ "@langchain/core/prompts");
const output_parsers_1 = __webpack_require__(/*! @langchain/core/output_parsers */ "@langchain/core/output_parsers");
class LangChainService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        console.log('API Key:', apiKey);
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not configured in environment variables');
        }
        this.model = new groq_1.ChatGroq({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            apiKey: apiKey,
        });
    }
    async generateResponse(question) {
        try {
            const response = await this.model.invoke(question);
            return String(response.content);
        }
        catch (error) {
            throw new Error(`Error generating response: ${error.message}`);
        }
    }
    async analyzeFinancialData(data) {
        try {
            const prompt = `As a financial expert, analyze this data and provide insights: ${data}`;
            const response = await this.model.invoke(prompt);
            return String(response.content);
        }
        catch (error) {
            throw new Error(`Error analyzing data: ${error.message}`);
        }
    }
    async summarizeText(text) {
        try {
            const prompt = `Please provide a concise summary of the following text: ${text}`;
            const response = await this.model.invoke(prompt);
            return String(response.content);
        }
        catch (error) {
            throw new Error(`Error summarizing text: ${error.message}`);
        }
    }
    async processUserInputWithLcelChain(userInput) {
        try {
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                ['system', 'You are a helpful AI assistant.'],
                ['user', '{input}'],
            ]);
            const outputParser = new output_parsers_1.StringOutputParser();
            const chain = prompt.pipe(this.model).pipe(outputParser);
            const response = await chain.invoke({ input: userInput });
            return response;
        }
        catch (error) {
            throw new Error(`Error processing input with LCEL chain: ${error.message}`);
        }
    }
    async processExtractedData(extractedData) {
        try {
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    'system',
                    'You are an expert in data analysis. Analyze the following extracted data and provide insights.',
                ],
                ['user', '{input}'],
            ]);
            const outputParser = new output_parsers_1.StringOutputParser();
            const chain = prompt.pipe(this.model).pipe(outputParser);
            const response = await chain.invoke({ input: extractedData });
            return response;
        }
        catch (error) {
            throw new Error(`Error processing extracted data with LCEL chain: ${error.message}`);
        }
    }
    async processAgent2CategoryMatching(matchingData) {
        try {
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    'system',
                    'You are an AI assistant specialized in refining financial transaction categories based on matching scores.',
                ],
                ['user', '{input}'],
            ]);
            const outputParser = new output_parsers_1.StringOutputParser();
            const chain = prompt.pipe(this.model).pipe(outputParser);
            const response = await chain.invoke({ input: matchingData });
            return response;
        }
        catch (error) {
            throw new Error(`Error processing Agent 2 category matching with LCEL chain: ${error.message}`);
        }
    }
    async processAgent3AutoCategorization(categorizationData) {
        try {
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    'system',
                    'You are an AI assistant specialized in automatically categorizing financial transactions.',
                ],
                ['user', '{input}'],
            ]);
            const outputParser = new output_parsers_1.StringOutputParser();
            const chain = prompt.pipe(this.model).pipe(outputParser);
            const response = await chain.invoke({ input: categorizationData });
            return response;
        }
        catch (error) {
            throw new Error(`Error performing Agent 3 auto-categorization with LCEL chain: ${error.message}`);
        }
    }
}
exports.LangChainService = LangChainService;


/***/ }),

/***/ "./apps/modules/data-extractor.module.ts":
/*!***********************************************!*\
  !*** ./apps/modules/data-extractor.module.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataExtractorModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const data_extractor_controller_1 = __webpack_require__(/*! ./first-agent/data-extractor.controller */ "./apps/modules/first-agent/data-extractor.controller.ts");
const data_extractor_service_1 = __webpack_require__(/*! ./first-agent/service/data-extractor.service */ "./apps/modules/first-agent/service/data-extractor.service.ts");
const langchain_service_1 = __webpack_require__(/*! ../libs/langchain/langchain.service */ "./apps/libs/langchain/langchain.service.ts");
let DataExtractorModule = class DataExtractorModule {
};
exports.DataExtractorModule = DataExtractorModule;
exports.DataExtractorModule = DataExtractorModule = __decorate([
    (0, common_1.Module)({
        controllers: [data_extractor_controller_1.DataExtractorController],
        providers: [data_extractor_service_1.DataExtractorService, langchain_service_1.LangChainService],
        exports: [data_extractor_service_1.DataExtractorService],
    })
], DataExtractorModule);


/***/ }),

/***/ "./apps/modules/first-agent/data-extractor.controller.ts":
/*!***************************************************************!*\
  !*** ./apps/modules/first-agent/data-extractor.controller.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataExtractorController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const data_extractor_service_1 = __webpack_require__(/*! ./service/data-extractor.service */ "./apps/modules/first-agent/service/data-extractor.service.ts");
let DataExtractorController = class DataExtractorController {
    constructor(dataExtractorService) {
        this.dataExtractorService = dataExtractorService;
    }
    async extractData(file) {
        try {
            const data = await this.dataExtractorService.extractData(file);
            if (!this.dataExtractorService.validateData(data)) {
                throw new Error('Invalid data format extracted from file');
            }
            return {
                success: true,
                data,
                preview: data.slice(0, 5),
                totalRows: data.length,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.DataExtractorController = DataExtractorController;
__decorate([
    (0, common_1.Post)('extract'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof Express !== "undefined" && (_b = Express.Multer) !== void 0 && _b.File) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], DataExtractorController.prototype, "extractData", null);
exports.DataExtractorController = DataExtractorController = __decorate([
    (0, common_1.Controller)('data-extractor'),
    __metadata("design:paramtypes", [typeof (_a = typeof data_extractor_service_1.DataExtractorService !== "undefined" && data_extractor_service_1.DataExtractorService) === "function" ? _a : Object])
], DataExtractorController);


/***/ }),

/***/ "./apps/modules/first-agent/service/data-extractor.service.ts":
/*!********************************************************************!*\
  !*** ./apps/modules/first-agent/service/data-extractor.service.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DataExtractorService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const langchain_service_1 = __webpack_require__(/*! ../../../libs/langchain/langchain.service */ "./apps/libs/langchain/langchain.service.ts");
const pdf = __webpack_require__(/*! pdf-parse */ "pdf-parse");
const XLSX = __webpack_require__(/*! xlsx */ "xlsx");
const csv = __webpack_require__(/*! csv-parse */ "csv-parse");
let DataExtractorService = class DataExtractorService {
    constructor(langChainService) {
        this.langChainService = langChainService;
        this.defaultColumnMapping = {
            date: 'Date',
            description: 'Particulars/Description',
            withdrawal: 'Withdrawal',
            deposit: 'Deposit',
            balance: 'Balance',
        };
    }
    async extractText(file) {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return this.extractFromPDF(file);
            case 'xlsx':
            case 'xls':
                return this.extractFromExcel(file);
            case 'csv':
                return this.extractFromCSV(file);
            default:
                throw new Error(`Unsupported file format: ${fileExtension}`);
        }
    }
    async extractData(file) {
        const text = await this.extractText(file);
        const data = await this.extractDataFromFile(text);
        return data;
    }
    async extractDataFromFile(text) {
        try {
            const prompt = `
        Extract transaction data from the following text. 
        Return the data in JSON format with the following structure:
        {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number,
              "given_to": "string"
            }
          ]
        }

        The given_to field is the name of the person or entity that the money was given to.
        If the money was given to a person, the given_to field should be the name of the person.
        If the money was given to an entity like a shop, a restaurant, a bank, etc., the given_to field should be the name of the entity.
        If the money is credited to your account, the given_to field should be "Self".
       
        Text to process:
        ${text}
      `;
            const response = await this.langChainService.generateResponse(prompt);
            const parsedData = JSON.parse(response);
            return parsedData.transactions;
        }
        catch (error) {
            throw new Error(`Error extracting data from PDF: ${error.message}`);
        }
    }
    async AutoCategorizeTransactions(transactions) {
        const prompt = `
      Categorize the following transactions into categories.
      Return the data in JSON format with the following structure:
      {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number,
              "given_to": "string",
              "category": "string",
              "matching_score": number
            }
          ]
        }

        The matching_score field is the score of the auto categorization based upon the description and the given_to field.
        Matching score will be in range from 0 to 100
        The category field is the category of the transaction based upon the description and the given_to field.
        Auto categorize the transactions based upon the description and the given_to field.
        The category field could be one of the following or might not be listed here:
        - Food
        - Transport
        - Entertainment
        - Shopping
        - Other

        Text to process:
        ${JSON.stringify(transactions)}
    `;
        const response = await this.langChainService.generateResponse(prompt);
        const parsedData = JSON.parse(response);
        return parsedData.transactions;
    }
    async MatchTransactionsCategory(prevTansactions, currentTransaction) {
        const prompt = `
      Match the category of the current transaction with the previous transactions.
      Return the data in JSON format with the following structure:
      {
          "transactions": [
            {
              "date": "YYYY-MM-DD",
              "description": "string",
              "withdrawal": number,
              "deposit": number,
              "balance": number,
              "given_to": "string",
              "category": "string",
              "matching_score": number
            }
          ]
        }

        The matching_score field is the score of the auto categorization based upon the category field of the previous transactions.
        Matching score will be in range from 0 to 100
        The category field is the category of the transaction based upon the description and the given_to field.
        Match the category of the current transaction with the previous transactions.
        

        Text to process:
        ${JSON.stringify(prevTansactions)}
        ${JSON.stringify(currentTransaction)}
    `;
        const response = await this.langChainService.generateResponse(prompt);
        const parsedData = JSON.parse(response);
        return parsedData.transactions;
    }
    async extractFromPDF(file) {
        try {
            const data = await pdf(file.buffer);
            return data.text;
        }
        catch (error) {
            throw new Error(`Error extracting text from PDF: ${error.message}`);
        }
    }
    async extractFromExcel(file) {
        try {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csvData = XLSX.utils.sheet_to_csv(worksheet);
            return csvData;
        }
        catch (error) {
            throw new Error(`Error extracting text from Excel: ${error.message}`);
        }
    }
    async extractFromCSV(file) {
        return new Promise((resolve, reject) => {
            let textContent = '';
            const parser = csv.parse({
                columns: true,
                skip_empty_lines: true,
            });
            parser.on('readable', () => {
                let record;
                while ((record = parser.read())) {
                    textContent += Object.values(record).join(', ') + '\n';
                }
            });
            parser.on('error', error => {
                reject(new Error(`Error extracting text from CSV: ${error.message}`));
            });
            parser.on('end', () => {
                resolve(textContent);
            });
            parser.write(file.buffer);
            parser.end();
        });
    }
    validateData(data) {
        return data.every(transaction => {
            return (transaction.date &&
                transaction.description &&
                typeof transaction.withdrawal === 'number' &&
                typeof transaction.deposit === 'number' &&
                typeof transaction.balance === 'number');
        });
    }
};
exports.DataExtractorService = DataExtractorService;
exports.DataExtractorService = DataExtractorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof langchain_service_1.LangChainService !== "undefined" && langchain_service_1.LangChainService) === "function" ? _a : Object])
], DataExtractorService);


/***/ }),

/***/ "./apps/request/requestContext.service.ts":
/*!************************************************!*\
  !*** ./apps/request/requestContext.service.ts ***!
  \************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequestContextService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
let RequestContextService = class RequestContextService {
    constructor(req) {
        this.req = req;
        this.request = null;
        this.request = req;
    }
    setRequest(req) {
        this.request = req;
    }
    getRequest() {
        return this.request;
    }
    getCID() {
        return this.request?.cid || undefined;
    }
    getRoute() {
        return `${this.request?.method} ${this.request?.baseUrl}${this.request?.url}`;
    }
};
exports.RequestContextService = RequestContextService;
exports.RequestContextService = RequestContextService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [Object])
], RequestContextService);


/***/ }),

/***/ "./apps/src/app.controller.ts":
/*!************************************!*\
  !*** ./apps/src/app.controller.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const winston_1 = __webpack_require__(/*! winston */ "winston");
const js_1 = __webpack_require__(/*! @axiomhq/js */ "@axiomhq/js");
const app_service_1 = __webpack_require__(/*! apps/src/app.service */ "./apps/src/app.service.ts");
const request_Context_logger_1 = __webpack_require__(/*! apps/factories/request.Context.logger */ "./apps/factories/request.Context.logger.ts");
let AppController = class AppController {
    constructor(appService, configService, logger) {
        this.appService = appService;
        this.configService = configService;
        this.logger = logger;
        this.axiom = new js_1.Axiom({
            token: this.configService.get('env.axiomToken'),
        });
    }
    async getHello() {
        this.logger.info('Getting Hello from AppController');
        await this.axiom.ingest(this.configService.get('env.axiomDataset'), {
            _time: new Date().toISOString(),
            message: 'Getting Hello from AppController',
            service: 'app-controller',
            method: 'getHello',
            environment: this.configService.get('env.nodeEnv'),
        });
        return this.appService.getHello();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AppController.prototype, "getHello", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(2, (0, common_1.Inject)(request_Context_logger_1.REQ_CTX_LOGGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object, typeof (_c = typeof winston_1.Logger !== "undefined" && winston_1.Logger) === "function" ? _c : Object])
], AppController);


/***/ }),

/***/ "./apps/src/app.module.ts":
/*!********************************!*\
  !*** ./apps/src/app.module.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const winston_1 = __webpack_require__(/*! winston */ "winston");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const env_config_1 = __webpack_require__(/*! ../config/env.config */ "./apps/config/env.config.ts");
const mongoose_2 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apps/src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/src/app.service.ts");
const app_logger_1 = __webpack_require__(/*! apps/factories/app.logger */ "./apps/factories/app.logger.ts");
const request_Context_logger_1 = __webpack_require__(/*! apps/factories/request.Context.logger */ "./apps/factories/request.Context.logger.ts");
const requestContext_service_1 = __webpack_require__(/*! apps/request/requestContext.service */ "./apps/request/requestContext.service.ts");
const logger_config_1 = __webpack_require__(/*! apps/config/logger.config */ "./apps/config/logger.config.ts");
const data_extractor_module_1 = __webpack_require__(/*! apps/modules/data-extractor.module */ "./apps/modules/data-extractor.module.ts");
let AppModule = class AppModule {
    constructor(configService, logger, connection) {
        this.configService = configService;
        this.logger = logger;
        this.connection = connection;
        this.connection.on('open', () => {
            this.logger.info('MongoDB connection established successfully');
        });
        this.connection.on('error', _error => {
            this.logger.error('MongoDB connection error:', _error);
        });
    }
    onApplicationBootstrap() {
        this.logger.info(`APP: [${this.configService.get('APP_NAME')}] Running in ${this.configService.get('NODE_ENV')} mode on PORT ${this.configService.get('PORT')}`);
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                ...env_config_1.ConfigOptions,
                load: [logger_config_1.default],
            }),
            data_extractor_module_1.DataExtractorModule,
            mongoose_2.MongooseModule.forRootAsync({
                useFactory: async (configService) => {
                    if (configService.get('NODE_ENV') === 'development') {
                        mongoose_1.default.set('debug', true);
                    }
                    return {
                        uri: configService.get('MONGO_URI'),
                        dbName: configService.get('MONGO_DB_NAME'),
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            common_1.Logger,
            mongoose_1.Connection,
            app_logger_1.appLoggerFactory,
            request_Context_logger_1.reqCtxLoggerFactory,
            requestContext_service_1.RequestContextService,
        ],
    }),
    __param(1, (0, common_1.Inject)(app_logger_1.APP_LOGGER)),
    __param(2, (0, mongoose_2.InjectConnection)()),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof winston_1.Logger !== "undefined" && winston_1.Logger) === "function" ? _b : Object, typeof (_c = typeof mongoose_1.Connection !== "undefined" && mongoose_1.Connection) === "function" ? _c : Object])
], AppModule);


/***/ }),

/***/ "./apps/src/app.service.ts":
/*!*********************************!*\
  !*** ./apps/src/app.service.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const js_1 = __webpack_require__(/*! @axiomhq/js */ "@axiomhq/js");
const app_logger_1 = __webpack_require__(/*! apps/factories/app.logger */ "./apps/factories/app.logger.ts");
const request_Context_logger_1 = __webpack_require__(/*! apps/factories/request.Context.logger */ "./apps/factories/request.Context.logger.ts");
const winston_1 = __webpack_require__(/*! winston */ "winston");
let AppService = class AppService {
    constructor(configService, logger, appLogger) {
        this.configService = configService;
        this.logger = logger;
        this.appLogger = appLogger;
        this.axiom = new js_1.Axiom({
            token: this.configService.get('env.axiomToken'),
        });
    }
    async getHello() {
        this.logger.debug('Hello from AppService');
        this.appLogger.debug('Hello from AppService');
        await this.axiom.ingest(this.configService.get('env.axiomDataset'), {
            _time: new Date().toISOString(),
            message: 'Processing getHello business logic',
            service: 'app-service',
            method: 'getHello',
            environment: this.configService.get('env.nodeEnv'),
            apiPrefix: this.configService.get('env.apiPrefix'),
        });
        return `Hello World! from ${this.configService.get('env.apiPrefix')}`;
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(request_Context_logger_1.REQ_CTX_LOGGER)),
    __param(2, (0, common_1.Inject)(app_logger_1.APP_LOGGER)),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof winston_1.Logger !== "undefined" && winston_1.Logger) === "function" ? _b : Object, typeof (_c = typeof winston_1.Logger !== "undefined" && winston_1.Logger) === "function" ? _c : Object])
], AppService);


/***/ }),

/***/ "./apps/utils/colorize.ts":
/*!********************************!*\
  !*** ./apps/utils/colorize.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.colorizeLevel = colorizeLevel;
exports.colorizeMessage = colorizeMessage;
const chalk = __webpack_require__(/*! chalk */ "chalk");
function colorizeLevel(level) {
    switch (level) {
        case 'info':
            return chalk.green(level.toUpperCase());
        case 'debug':
            return chalk.magenta(level.toUpperCase());
        case 'warn':
            return chalk.yellow(level.toUpperCase());
        case 'error':
            return chalk.red(level.toUpperCase());
        default:
            return chalk.white(level.toUpperCase());
    }
}
function colorizeMessage(level, message) {
    switch (level) {
        case 'info':
            return chalk.green(message);
        case 'debug':
            return chalk.magenta(message);
        case 'warn':
            return chalk.yellow(message);
        case 'error':
            return chalk.red(message);
        default:
            return chalk.green(message);
    }
}


/***/ }),

/***/ "./apps/utils/messageFormatter.ts":
/*!****************************************!*\
  !*** ./apps/utils/messageFormatter.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatAppLogMessage = exports.formatReqLogMessage = void 0;
const winston_1 = __webpack_require__(/*! winston */ "winston");
const chalk = __webpack_require__(/*! chalk */ "chalk");
const colorize_1 = __webpack_require__(/*! ./colorize */ "./apps/utils/colorize.ts");
const formatReqLogMessage = () => winston_1.format.printf(info => {
    const message = `${(0, colorize_1.colorizeLevel)(info.level || '')} ${chalk.yellow(`[${info.app}]`)} ${(0, colorize_1.colorizeMessage)(info.level, `[${info.route}]`)} ${info.timestamp} ${chalk.green(info.type)} ${chalk.yellow(`[${info.context}]`)} ${(0, colorize_1.colorizeMessage)(info.level, JSON.stringify(info.message, null, 2))} ${(0, colorize_1.colorizeMessage)(info.level, `[${info.cid}]`)}`;
    if (process.env.NODE_ENV === 'production')
        return `${message}\n${JSON.stringify(info, null, 2)}`;
    return message;
});
exports.formatReqLogMessage = formatReqLogMessage;
const formatAppLogMessage = () => winston_1.format.printf(info => {
    const message = `${(0, colorize_1.colorizeLevel)(info.level || '')} ${chalk.yellow(`[${info.app}]`)} ${info.timestamp} ${chalk.green(info.type)} ${chalk.yellow(`[${info.context}]`)} ${(0, colorize_1.colorizeMessage)(info.level, info.message)}`;
    if (process.env.NODE_ENV === 'production')
        return `${message}`;
    return message;
});
exports.formatAppLogMessage = formatAppLogMessage;


/***/ }),

/***/ "@axiomhq/js":
/*!******************************!*\
  !*** external "@axiomhq/js" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@axiomhq/js");

/***/ }),

/***/ "@axiomhq/winston":
/*!***********************************!*\
  !*** external "@axiomhq/winston" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@axiomhq/winston");

/***/ }),

/***/ "@langchain/core/output_parsers":
/*!*************************************************!*\
  !*** external "@langchain/core/output_parsers" ***!
  \*************************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/output_parsers");

/***/ }),

/***/ "@langchain/core/prompts":
/*!******************************************!*\
  !*** external "@langchain/core/prompts" ***!
  \******************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/prompts");

/***/ }),

/***/ "@langchain/groq":
/*!**********************************!*\
  !*** external "@langchain/groq" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@langchain/groq");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/***/ ((module) => {

module.exports = require("chalk");

/***/ }),

/***/ "csv-parse":
/*!****************************!*\
  !*** external "csv-parse" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("csv-parse");

/***/ }),

/***/ "joi":
/*!**********************!*\
  !*** external "joi" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("joi");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "pdf-parse":
/*!****************************!*\
  !*** external "pdf-parse" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("pdf-parse");

/***/ }),

/***/ "winston":
/*!**************************!*\
  !*** external "winston" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("winston");

/***/ }),

/***/ "xlsx":
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("xlsx");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************!*\
  !*** ./apps/src/main.ts ***!
  \**************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/src/app.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(3000);
}
bootstrap();

})();

/******/ })()
;