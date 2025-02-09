import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { createDebugger } from "../utils/debugConfig";
import { app } from "./firebaseDB";

const log = createDebugger("firebaseStorage");
const logError = log.extend("error");

const storage = getStorage(app);

// Function to upload an image
const uploadImage = async (
	file: Buffer,
	name: string
): Promise<string> => {
	try {
		log("Buffer length:", file.length);
		const storageRef = ref(storage, `images/${name}`);
		const snapshot = await uploadBytes(storageRef, file);
		const downloadURL = await getDownloadURL(snapshot.ref);

		log("Archivo subido correctamente");
		return downloadURL;
	} catch (error) {
		logError("Error al subir la imagen:", error);
		throw error;
	}
};

export { uploadImage };
