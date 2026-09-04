"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fields_1 = require("@aztec/aztec.js/fields");
var keys_1 = require("@aztec/stdlib/keys");
var addresses_1 = require("@aztec/aztec.js/addresses");
var fee_1 = require("@aztec/aztec.js/fee");
var schnorr_1 = require("@aztec/accounts/schnorr");
var embedded_1 = require("@aztec/wallets/embedded");
var aztec_js_1 = require("@aztec/aztec.js");
var fs = require("fs");
var path = require("path");
var NODE_URL = process.env.AZTEC_NODE_URL || 'https://node.aztec.network';
var SECRET = process.env.AZTEC_RELAYER_SECRET_KEY || '0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36';
var SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pxe, nodeInfo, secretKey, signingKey, account, wallet, adminAddr, fpcAddress, paymentMethod, registryPath, registryArtifact, registryTx, e_1, paymasterPath, paymasterArtifact, paymasterTx, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('══════════════════════════════════════════════════════');
                    console.log('  Aztec Mainnet Deployment — Infrastructure Contracts');
                    console.log('══════════════════════════════════════════════════════');
                    console.log('\n🔗 Initializing EmbeddedWallet...');
                    return [4 /*yield*/, embedded_1.EmbeddedWallet.create(NODE_URL, {
                            ephemeral: true,
                            pxeConfig: { proverEnabled: true }
                        })];
                case 1:
                    pxe = _a.sent();
                    return [4 /*yield*/, pxe.getNodeInfo()];
                case 2:
                    nodeInfo = _a.sent();
                    console.log("\uD83C\uDF10 Network: chain=".concat(nodeInfo.l2ChainId, " version=").concat(nodeInfo.protocolVersion));
                    console.log('🔑 Loading relayer account...');
                    secretKey = fields_1.Fr.fromHexString(SECRET.replace(/^0x/i, ''));
                    signingKey = (0, keys_1.deriveSigningKey)(secretKey);
                    account = (0, schnorr_1.getSchnorrAccount)(pxe, secretKey, signingKey);
                    return [4 /*yield*/, account.register()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, account.getWallet()];
                case 4:
                    wallet = _a.sent();
                    adminAddr = wallet.getAddress();
                    console.log("\uD83D\uDC5B Relayer address: ".concat(adminAddr.toString()));
                    fpcAddress = addresses_1.AztecAddress.fromString(SPONSORED_FPC);
                    paymentMethod = new fee_1.SponsoredFeePaymentMethod(fpcAddress);
                    // Deploy Registry
                    console.log('\n📦 Deploying ProvenanceRegistry...');
                    registryPath = path.resolve(__dirname, '../noir-projects/contracts/registry-contract/target/provenance_registry-ProvenanceRegistry.json');
                    registryArtifact = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, aztec_js_1.Contract.deploy(wallet, registryArtifact, [])
                            .send({ fee: { paymentMethod: paymentMethod } })
                            .deployed()];
                case 6:
                    registryTx = _a.sent();
                    console.log("\u2705 ProvenanceRegistry deployed at: ".concat(registryTx.contract.address.toString()));
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    console.error('❌ Registry deploy failed:', (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1);
                    return [3 /*break*/, 8];
                case 8:
                    // Deploy Paymaster
                    console.log('\n📦 Deploying NativePaymaster...');
                    paymasterPath = path.resolve(__dirname, '../noir-projects/contracts/paymaster-contract/target/native_paymaster-NativePaymaster.json');
                    paymasterArtifact = JSON.parse(fs.readFileSync(paymasterPath, 'utf8'));
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, aztec_js_1.Contract.deploy(wallet, paymasterArtifact, [])
                            .send({ fee: { paymentMethod: paymentMethod } })
                            .deployed()];
                case 10:
                    paymasterTx = _a.sent();
                    console.log("\u2705 NativePaymaster deployed at: ".concat(paymasterTx.contract.address.toString()));
                    return [3 /*break*/, 12];
                case 11:
                    e_2 = _a.sent();
                    console.error('❌ Paymaster deploy failed:', (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || e_2);
                    return [3 /*break*/, 12];
                case 12:
                    console.log('\n✅ Deployment process finished!');
                    return [4 /*yield*/, pxe.stop()];
                case 13:
                    _a.sent();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('\n💥 Deployment failed:', (err === null || err === void 0 ? void 0 : err.message) || err);
    process.exit(1);
});
