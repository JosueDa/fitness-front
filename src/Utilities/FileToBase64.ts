export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Elimina el encabezado "data:image/jpeg;base64,"
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
