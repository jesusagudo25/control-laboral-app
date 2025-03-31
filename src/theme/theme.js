import { createTheme } from "@rneui/themed";

const theme = createTheme({
  colors: {
    primary: "#1E6091", // Azul profundo, confiable
    secondary: "#168AAD", // Azul medio, moderno
    accent: "#f7941e", // Naranja suave, para resaltar
    error: "#E76F51", // Rojo terracota, menos agresivo
    success: "#4CAF50", // Verde equilibrado, profesional
    warning: "#F4A261", // Naranja suave, sin ser llamativo
    info: "#468FAF", // Azul grisáceo, más sutil
    text: "#0D0D0D", // Negro suave, para buena lectura
    background: "#F6F6F6", // Gris claro, para mejor contraste
    border: "#B0B0B0", // Gris medio, discreto
    header: "#FFF", // Blanco
    disabled: "#F4A261", // Light gray for disabled elements
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  typography: {
    fonts: {
      body: "Arial",
      heading: "Arial",
      monospace: "Arial",
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
    },
    fontWeights: {
      normal: "400",
      medium: "500",
      bold: "700",
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
    },
  },
  boxHidden: {
    backgroundColor: "#f7941e",
    height: 200,
    position: "relative",
  },
  containerBoxHidden: {
    flex: 1,
    padding: 30,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    marginTop: 25,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#1E6091",
    padding: 11,
    marginBottom: 15,
    color: "#000",
    backgroundColor: "#fff",
  },
  buttonPrimary: {
    backgroundColor: "#000",
    padding: 10,
    margin: 10,
    color: "#fff",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 10,
    color: "#000",
  },
  buttonRequest: {
    height: 130,
  },
  textPrimary: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#000",
  },
  textSecondary: {
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
  },
  textRequest: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 5,
    color: "#0D0D0D",
  },
  textSigning: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    color: "#0D0D0D",
  },
  titleSigning: {
    fontSize: 14.5,
    textAlign: "left",
    color: "#0D0D0D",
    marginVertical: 5,
  },
  hoursSigning: {
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "left",
    color: "#0D0D0D",
    marginVertical: 5,
  },
  paragraphRequest: {
    fontSize: 14.5,
    textAlign: "left",
    color: "#0D0D0D",
  },
  card: {
    borderRadius: 6,
    height: 180,
    borderColor: "#1E6091",
    borderWidth: 1,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
  },
  showSigning: {
    borderRadius: 6,
    borderColor: "#1E6091",
    borderWidth: 1,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
  },
});

export default theme;
