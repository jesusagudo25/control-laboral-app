import React from "react";

const useForm = (initialForm = {}) => {
  const [formState, setFormState] = React.useState(initialForm);

  const handleInputChange = (name, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormState(initialForm);
  };

  return {
    ...formState,
    formState,
    handleInputChange,
    handleReset,
  };
};

export default useForm;
