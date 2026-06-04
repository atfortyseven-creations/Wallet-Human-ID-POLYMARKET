# Etherscan API Key Setup

##  CRÍTICO: Necesitas un API Key de Etherscan

### Por qué es necesario:
- **Sin API Key**: 1 request cada 5 segundos (DEMASIADO LENTO)
- **Con API Key**: 5 requests por segundo (SUFICIENTE para producción)

### Cómo obtener tu API Key GRATIS:

1. **Ve a Etherscan**
   - https://etherscan.io/myapikey

2. **Regístrate/Inicia sesión**
   - Click en "Sign In" o "Register"
   - Usa tu email

3. **Crea un API Key**
   - Click en "+ Add" en la sección "API-KEYs"
   - Nombre: "Human DeFi Production"
   - Click "Create New API Key"

4. **Copia tu API Key**
   - Se verá algo como: `ABC123XYZ456DEF789GHI012JKL345MN`

5. **Agrégala a tu .env.local**
   ```bash
   ETHERSCAN_API_KEY=TU_API_KEY_AQUI
   ```

6. **Reinicia el servidor**
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

##  Verificación

Una vez configurado, deberías ver en los logs:

```
[ETHERSCAN]  0xd8da6bf26964af9d7eed9e03e53415d37aa96045: 1234.5678 ETH ($3,086,419.50)
```

**Con API Key = Balance REAL y RÁPIDO para CUALQUIER cartera**
