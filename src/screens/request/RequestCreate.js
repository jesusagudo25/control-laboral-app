import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Button, Image, Dialog, Divider } from "@rneui/themed";
import { useTheme } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import useApi from "../../hooks/useApi"; // Hook para manejar la URL de la API
import axios from "axios";
import CustomModal from "../../components/CustomModal";

const RequestCreate = ({ navigation }) => {
  const { apiUrl } = useApi(); // Hook para manejar la URL de la API
  const { theme } = useTheme(); // Obtener el tema actual

  const [types, setTypes] = useState([]);
  const [statusTypes, setStatusTypes] = useState([]);
  const [reviewers, setReviewers] = useState([]);

  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startShift, setStartShift] = useState("morning");
  const [endShift, setEndShift] = useState("afternoon");
  const [reviewer, setReviewer] = useState("");
  const [description, setDescription] = useState("");

  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------------
  const getRequestFields = async () => {
    setLoadingFields(true);
    // Aquí harías la petición a la API para obtener los campos de la solicitud
    const response = await axios.get(
      `${apiUrl}/custom/fichajes/api/index.php?action=request_fields`
    );

    setTypes(response.data.msg.tipo);
    //Seleccionar el primer tipo por defecto
    if (response.data.msg.tipo.length > 0) {
      setType(response.data.msg.tipo[0].id);
    }
    //2- estado
    setStatusTypes(response.data.msg.status);
    //3- revisores
    setReviewers(response.data.msg.revisada_por);
    //Seleccionar el primer revisor por defecto
    if (response.data.msg.revisada_por.length > 0) {
      setReviewer(response.data.msg.revisada_por[0].id);
    }

    setLoadingFields(false);
  };

  // Convertir fecha a YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!description.trim()) {
      setMessage("La descripción es obligatoria.");
      setShowDialog(true);
      setLoading(false);
      return;
    }

    //validar que la fecha de fin no sea anterior a la de inicio
    if (endDate < startDate) {
      setMessage("La fecha de fin no puede ser anterior a la de inicio.");
      setShowDialog(true);
      setLoading(false);
      return;
    }
    //validar que el tipo no esté vacío
    if (!type) {
      setMessage("El tipo de solicitud es obligatorio.");
      setShowDialog(true);
      setLoading(false);
      return;
    }
    //validar que el revisor no esté vacío
    if (!reviewer) {
      setMessage("El revisor es obligatorio.");
      setShowDialog(true);
      setLoading(false);
      return;
    }
    // Crear el payload para enviar a la API

    const payload = {
      action: "user_request",
      tipo: type,
      fecha_inicio: formatDate(startDate),
      fecha_inicio_jornada: startShift,
      fecha_fin: formatDate(endDate),
      fecha_fin_jornada: endShift,
      revisada_por: reviewer,
      descripcion: description,
    };

    try {
      // Aquí haces la petición a la API
      const response = await axios.post(
        `${apiUrl}/custom/fichajes/api/index.php`,
        payload
      );
      console.log("Respuesta de la API:", response.data);
      if (response.data.success === false) {
        setMessage(response.data.msg || "Hubo un error al crear la solicitud.");
        setShowDialog(true);
        setLoading(false);
        return;
      }

      if (response.data.success === true) {
        navigation.navigate("Inicio", {
          screen: "Request",
          params: { newRequest: true },
        });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage("Hubo un error al crear la solicitud.");
      setShowDialog(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    getRequestFields();
  }, []);

  if (loadingFields) {
    return (
      <ActivityIndicator
        size="large"
        color="#f7941e"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={theme.container}>
        <Text style={[theme.textSecondary, { marginBottom: 20 }]}>
          Completa los siguientes datos para crear una nueva solicitud.
        </Text>

        {/* Tipo de solicitud */}
        <Text style={theme.label}>Tipo de solicitud</Text>
        <View style={theme.input}>
          <Picker
            selectedValue={type}
            onValueChange={(value) => setType(value)}
            style={{ color: "#000" }} // solo color de texto aquí
            dropdownIconColor="#1E6091" // opcional: cambia el color del ícono ▼
          >
            {types.map((t) => (
              <Picker.Item key={t.id} label={t.name} value={t.id} />
            ))}
          </Picker>
        </View>

        {/* Fecha inicio */}
        <Text style={theme.label}>Fecha de inicio</Text>
        <TouchableOpacity
          style={theme.input}
          onPress={() => setShowInicioPicker(true)}
        >
          <Text>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showInicioPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowInicioPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}

        {/* Jornada inicio */}
        <Text style={theme.label}>Jornada de inicio</Text>
        <View style={theme.input}>
          <Picker
            selectedValue={startShift}
            onValueChange={(value) => setStartShift(value)}
            style={{ color: "#000" }} // solo color de texto aquí
            dropdownIconColor="#1E6091" // opcional: cambia el color del ícono ▼
          >
            <Picker.Item label="Mañana" value="morning" />
            <Picker.Item label="Tarde" value="afternoon" />
          </Picker>
        </View>

        {/* Fecha fin */}
        <Text style={theme.label}>Fecha de fin</Text>
        <TouchableOpacity
          style={theme.input}
          onPress={() => setShowFinPicker(true)}
        >
          <Text>{formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showFinPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowFinPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        {/* Jornada fin */}
        <Text style={theme.label}>Jornada de fin</Text>
        <View style={theme.input}>
          <Picker
            selectedValue={endShift}
            onValueChange={(value) => setEndShift(value)}
            style={{ color: "#000" }} // solo color de texto aquí
            dropdownIconColor="#1E6091" // opcional: cambia el color del ícono ▼
          >
            <Picker.Item label="Mañana" value="morning" />
            <Picker.Item label="Tarde" value="afternoon" />
          </Picker>
        </View>

        {/* Revisor */}
        <Text style={theme.label}>Revisor</Text>
        <View style={theme.input}>
          <Picker
            selectedValue={reviewer}
            onValueChange={(value) => setReviewer(value)}
            style={{ color: "#000" }} // solo color de texto aquí
            dropdownIconColor="#1E6091" // opcional: cambia el color del ícono ▼
          >
            {reviewers.map((r) => (
              <Picker.Item key={r.id} label={r.name.trim()} value={r.id} />
            ))}
          </Picker>
        </View>

        {/* Descripción */}
        <Text style={theme.label}>Descripción</Text>
        <TextInput
          style={[theme.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Escribe el motivo de la solicitud"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Botón */}
        <Button
          title="Crear Solicitud"
          containerStyle={theme.buttonPrimaryContainer}
          buttonStyle={theme.buttonPrimaryStyle}
          loading={loading}
          onPress={handleSubmit}
          disabled={loading}
        />

        {/* Modal de mensajes */}
        <CustomModal
          isVisible={showDialog}
          onBackdropPress={() => setShowDialog(false)}
        >
          <Dialog.Title title="Aviso" />
          <Text>{message}</Text>
        </CustomModal>
      </View>
    </ScrollView>
  );
};

export default RequestCreate;
