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
    position: "absolute", // Para que se quede "debajo"
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
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
    padding: 12,
    marginBottom: 15,
    color: "#000",
    backgroundColor: "#fff",
  },
  label: {
    marginBottom: 8,
    color: "#000",
    fontWeight: "bold",
  },
  buttonPrimaryContainer: {
    marginTop: 15,
    marginBottom: 5,
    textAlign: "center",
  },
  buttonPrimaryStyle: {
    backgroundColor: "#f7941e",
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    textAlign: "center",
  },
  buttonSecondaryContainer: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonSecondaryStyle: {
    borderColor: "#1E6091",
    borderWidth: 1.2,
    borderRadius: 3,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "100%",
    textAlign: "center",
  },
  buttonRequest: {
    height: "auto",
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
    fontSize: 15,
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
    height: "auto",
    borderColor: "#1E6091",
    borderWidth: 1,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
  },
  cardCalendar: {
    borderRadius: 6,
    height: "auto",
    borderColor: "#1E6091",
    borderWidth: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    marginBottom: 10,
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
  textError: {
    fontSize: 14,
    color: "#E76F51",
    marginTop: 5,
    textAlign: "left",
    fontWeight: "bold",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    justifyContent: "space-around",
    gap: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    fontSize: 14,
    color: "#333",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  headerRequest: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleRequest: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },
  subtitleRequest: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "bold",
  },
  subtitleTextRequest: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: "400",
  },
  dateRequest: {
    fontSize: 15,
    marginTop: 5,
    color: "#777",
  },
  descriptionRequest: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
  descriptionTextRequest: {
    fontSize: 15,
    marginTop: 5,
    color: "#555",
  },
  statusRequest: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
  },
});

export default theme;
