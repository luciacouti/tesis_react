import { useState } from "react";
import CustomInput from "../../microcomponents/CustomInput";
import CreadoConExito from "../../microcomponents/CreadoConExito";
import { useEffect } from "react";
import PropTypes from "prop-types";
import { Cloudinary } from "@cloudinary/url-gen";
import CloudinaryUploadWidget from "../../microcomponents/cloudinaryWidget";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";
import GoogleMapComponent from "../../microcomponents/GoogleMaps";
import axios from "axios";

function EditarMascota({ idMascota }) {
  const [mascota, setMascota] = useState({});
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [imgMascota, setImgMascota] = useState("");
  const [previewMascota, setPreviewMascota] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetch(`https://tesis-react-backend.vercel.app/api/mascotas/${idMascota}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setMascota(data);
          setFormData((prevFormData) => ({
            ...prevFormData,
            provincia: data.provincia,
            municipio: data.municipio,
          }));
        }
      });
  }, [idMascota]);

  // const handleInputChange = (name, value) => {
  //   setFormData({ ...formData, [name]: value });
  // };

  const handleInputChange = (name, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (imgMascota) {
      formData.imagen = imgMascota;
    }

    fetch(
      `https://tesis-react-backend.vercel.app/api/mascotas/${mascota._id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setMascota({ ...mascota, ...data });
        setSuccess(true);
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrors(error.response.data.err.errors);
      });
  };

  const cld = new Cloudinary({
    cloud: {
      cloudName: "huellasacasa",
    },
  });

  useEffect(() => {
    const getProvincias = async () => {
      const { data } = await axios.get(
        "https://apis.datos.gob.ar/georef/api/provincias"
      );
      const provinciasNombre = data.provincias.map((prov) => prov.nombre);
      setProvincias(provinciasNombre);
    };
    getProvincias();
  }, []);

  useEffect(() => {
    const getMunicipios = async (provincia) => {
      if (provincia == "Ciudad Autónoma de Buenos Aires") {
        const { data } = await axios.get(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=caba&max=200`
        );
        const localidadesNombre = data.localidades.map((loc) => loc.nombre);
        localidadesNombre.sort();
        setMunicipios(localidadesNombre);
      } else {
        const { data } = await axios.get(
          `https://apis.datos.gob.ar/georef/api/municipios?provincia=${provincia}&max=200`
        );
        const municipiosNombre = data.municipios.map((muni) => muni.nombre);
        municipiosNombre.sort();
        setMunicipios(municipiosNombre);
      }
    };
    if (formData.provincia) {
      getMunicipios(formData.provincia);
    }
  }, [formData.provincia]);

  const imgMascotaRender = cld.image(previewMascota);

  // Función para renderizar el mapa con las coordenadas de la mascota
  const renderizarMapa = () => {
    if (mascota?.ubicacion) {
      return <GoogleMapComponent coordenadas={mascota?.ubicacion} />;
    } else {
      return <GoogleMapComponent />;
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="formulario-carga col-12 col-sm-10 col-md-10 col-lg-8 mx-auto">
        {/* <div className="aparecio-question">
          <p>¿Ya apareció?</p>
          <button type="button">No, todavía no</button>
          <button type="button" onClick={handleAparecio}>
            Sí, apareció
          </button>
        </div> */}
        <form id="form-crear_encontrado" onSubmit={handleFormSubmit}>
          {/* <div className="form-group">
        <label htmlFor="aparecio">¿Ya apareció?</label>
        <input
          type="checkbox"
          id="aparecio"
          name="aparecio"
          checked={formData.aparecio}
          onChange={(event) => handleInputChange('aparecio', event.target.checked)}
        />
      </div> */}
          <div className="row form_carga justify-content-center seccion-form-carga">
            <div className="col-lg-10">
              <h4>1. Para empezar</h4>
              <CustomInput
                label="¿Se perdió tu mascota o la encontraste perdida? (obligatorio)"
                initialValue={mascota.categoria}
                name="categoria"
                type="select"
                options={["Perdido", "Encontrado"]}
                onChange={handleInputChange}
              />{" "}
              <CustomInput
                label="¿Ya apareció la mascota?"
                initialValue={
                  mascota.aparecio ? "Sí, ya apareció" : "Todavía no"
                }
                name="aparecio"
                type="select"
                options={["Todavía no", "Sí, ya apareció"]}
                onChange={(name, value) => {
                  let state = value !== "Todavía no";
                  handleInputChange(name, state);
                }}
              />
            </div>
          </div>

          {/* <div className="col-lg-10">
              <CustomInput
                label="Categoria"
                initialValue={mascota.categoria}
                name="categoria"
                type="select"
                options={["Perdido", "Encontrado"]}
                onChange={handleInputChange}
              />{" "}
            </div> */}

          <div className="row form_carga justify-content-center seccion-form-carga">
            <div className="col-lg-10">
              <h4>2. Datos de la mascota</h4>
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Especie (obligatorio)"
                initialValue={mascota.especie}
                name="especie"
                type="select"
                options={["Perro", "Gato"]}
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Nombre"
                initialValue={mascota.nombre}
                name="nombre"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Tamaño (obligatorio)"
                initialValue={mascota.tamano}
                name="tamano"
                type="select"
                options={["Chico", "Mediano", "Grande"]}
                onChange={handleInputChange}
              />{" "}
            </div>

            {/* <div className="col-lg-10">
              <CustomInput
                label="Color (obligatorio)"
                name="color"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div> */}
            <div className="col-lg-10">
              <CustomInput
                label="Sexo (obligatorio)"
                initialValue={mascota.sexo}
                name="sexo"
                type="select"
                options={["Macho", "Hembra"]}
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Edad"
                initialValue={mascota.edad}
                name="edad"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Raza"
                initialValue={mascota.raza}
                name="raza"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Color"
                initialValue={mascota.color}
                name="color"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
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
            <div className="col-lg-10 mapa pt-4">
              {/* <p>
                ¿Nos compartis una foto de tu peludo? Seguro tenés un montón :)
              </p>
              <CloudinaryUploadWidget
                setImgMascota={setImgMascota}
                setPreviewMascota={setPreviewMascota}
              />

              <div className="foto-cloudinary">
                <AdvancedImage
                  // style={{ maxWidth: "100px" }}
                  className="img-fluid"
                  cldImg={imgMascotaRender}
                  plugins={[responsive(), placeholder()]}
                />
              </div> */}
              <p>Foto actual:</p>
              <div className="foto-cloudinary">
                {(previewMascota && (
                  <AdvancedImage
                    cldImg={imgMascotaRender}
                    plugins={[responsive(), placeholder()]}
                  />
                )) || <img src={mascota.imagen}></img>}
              </div>

              <p>Subir una nueva foto:</p>
              <CloudinaryUploadWidget
                setImgMascota={setImgMascota}
                setPreviewMascota={setPreviewMascota}
              />
            </div>
          </div>

          <div className="row form_carga justify-content-center seccion-form-carga">
            <div className="col-lg-10">
              <h4>3. Ubicación y fecha</h4>
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Fecha en la que se perdió o encontró la mascota (obligatorio)"
                initialValue={mascota.fecha}
                name="fecha"
                type="date"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Descripción: ¿Cómo se perdió o encontró? (obligatorio)"
                initialValue={mascota.descripcion}
                name="descripcion"
                type="textarea"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Provincia (obligatorio)"
                initialValue={mascota.provincia}
                name="provincia"
                type="select"
                options={provincias}
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Localidad (obligatorio)"
                initialValue={mascota.municipio}
                name="municipio"
                type="select"
                options={municipios}
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="col-lg-10">
              <CustomInput
                label="Más detalles del lugar (opcional)"
                initialValue={mascota.zona_perdida}
                name="zona_perdida"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
            <div className="mapa col-lg-10 py-4">
              <p>Marcá en el mapa donde se perdió o encontró la mascota</p>
              {renderizarMapa()}
            </div>
          </div>

          <div className="row form_carga justify-content-center seccion-form-carga">
            <div className="col-lg-10">
              <h4>4. Datos de contacto</h4>
            </div>

            <div className="col-lg-10">
              <CustomInput
                label="Celular (obligatorio)"
                initialValue={mascota.celular}
                name="celular"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>

            <div className="col-lg-10">
              <CustomInput
                label="WhatsApp"
                initialValue={mascota.whatsapp}
                name="whatsapp"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>

            <div className="col-lg-10">
              <CustomInput
                label="Email"
                initialValue={mascota.email}
                name="email"
                type="text"
                onChange={handleInputChange}
              />{" "}
            </div>
          </div>

          {success ? (
            <CreadoConExito
              especie={mascota.especie}
              categoria={mascota.categoria}
            />
          ) : (
            <>
              {errors && (
                <div className="row justify-content-center container-alertas">
                  <div className="col-lg-10">
                    <div className="alertas">
                      <ul>
                        {errors.map((error, index) => (
                          <li key={index}>
                            <i class="bi bi-exclamation-circle-fill p-1"></i>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <button
                id="boton-crear_encontrado"
                className="btn btn-primary redbtn text-white text-center w-100 col-lg-12 boton-color"
                type="submit"
              >
                Editar
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default EditarMascota;

EditarMascota.propTypes = {
  idMascota: PropTypes.string.isRequired,
};
