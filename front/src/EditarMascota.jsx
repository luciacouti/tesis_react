import { useState } from "react";
import CustomInput from "./microcomponents/CustomInput";
import CreadoConExito from "./microcomponents/CreadoConExito";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { Cloudinary } from "@cloudinary/url-gen";
import CloudinaryUploadWidget from "./microcomponents/cloudinaryWidget";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";

function EditarMascota({ idMascota }) {
  const [mascota, setMascota] = useState({});
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [imgMascota, setImgMascota] = useState("");
  const [previewMascota, setPreviewMascota] = useState("")

  useEffect(() => {
    fetch(`http://localhost:2023/api/mascotas/${idMascota}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setMascota(data);
        }
      });
  }, [idMascota]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (imgMascota) {
      formData.imagen = imgMascota;
    }

    fetch(`http://localhost:2023/api/mascotas/${mascota._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        setMascota({ ...mascota, ...data });
        setSuccess(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const cld = new Cloudinary({
    cloud: {
      cloudName: "huellasacasa"
    }
  });

  const imgMascotaRender = cld.image(previewMascota)

  return (
    <div>
      <form id="form-crear_encontrado" onSubmit={handleFormSubmit}>
        <div className="row form_carga">
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Categoria"
              initialValue={mascota.categoria}
              name="categoria"
              type="select"
              options={["Perdido", "Encontrado"]}
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Especie"
              initialValue={mascota.especie}
              name="especie"
              type="select"
              options={["Perro", "Gato"]}
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Nombre"
              initialValue={mascota.nombre}
              name="nombre"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Tamaño"
              initialValue={mascota.tamano}
              name="tamano"
              type="select"
              options={["Chico", "Mediano", "Grande"]}
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Color"
              initialValue={mascota.color}
              name="color"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Sexo"
              initialValue={mascota.sexo}
              name="sexo"
              type="select"
              options={["Macho", "Hembra"]}
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Edad"
              initialValue={mascota.edad}
              name="edad"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Raza"
              initialValue={mascota.raza}
              name="raza"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Collar"
              initialValue={mascota.collar}
              name="collar"
              type="select"
              options={[
                "Tiene collar con chapita",
                "Tiene collar sin chapita",
                "No tiene collar",
              ]}
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Zona"
              initialValue={mascota.zona_perdida}
              name="zona_perdida"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Fecha"
              initialValue={mascota.fecha}
              name="fecha"
              type="date"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Descripción"
              initialValue={mascota.descripcion}
              name="descripcion"
              type="textarea"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Email"
              initialValue={mascota.email}
              name="email"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="Celular"
              initialValue={mascota.celular}
              name="celular"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="WhatsApp"
              initialValue={mascota.whatsapp}
              name="whatsapp"
              type="text"
              onChange={handleInputChange}
            />{" "}
          </div>
          <div className="col-md-6 col-lg-4">
            <CustomInput
              label="URL a la foto"
              name="imagen"
              type="text"
              onChange={handleInputChange}
              initialValue={mascota.imagen}
            />{" "}
            <p>O subir una nueva foto</p>
            <CloudinaryUploadWidget setImgMascota={setImgMascota} setPreviewMascota={setPreviewMascota} />
            <div style={{ width: "100px" }}>
          {(previewMascota && <AdvancedImage
                style={{ maxWidth: "100px" }}
                cldImg={imgMascotaRender}
                plugins={[responsive(), placeholder()]}
              />) || <img src={mascota.imagen}></img>}
            </div>
          </div>
        </div>
        {success ? (
          <CreadoConExito
            especie={mascota.especie}
            categoria={mascota.categoria}
          />
        ) : (
          <button
            id="boton-crear_encontrado"
            className="btn btn-primary redbtn float-right my-2 text-white text-center my-5 col-md-2 boton-color"
            type="submit"
          >
            Editar
          </button>
        )}
      </form>
    </div>
  );
}

export default EditarMascota;

EditarMascota.propTypes = {
  idMascota: PropTypes.string.isRequired,
};
