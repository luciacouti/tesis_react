import { useEffect, useState } from "react";
import CustomInput from "../../microcomponents/CustomInput";
import CreadoConExito from "../../microcomponents/CreadoConExito";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import CloudinaryUploadWidget from "../../microcomponents/cloudinaryWidget";
import { AdvancedImage, responsive, placeholder } from "@cloudinary/react";
import GoogleMapComponent from "../../microcomponents/GoogleMaps";
import Swal from "sweetalert2";
import MascotaListItem from "./MascotaListItem";

function CrearMascota() {
  const [mascota, setMascota] = useState({});
  const [success, setSuccess] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [formData, setFormData] = useState({});
  const [imgMascota, setImgMascota] = useState("");
  const [previewMascota, setPreviewMascota] = useState("");
  const [coincidencias, setCoincidencias] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const setCoordenadas = (coord) => {
    formData.ubicacion = coord;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (imgMascota) {
      formData.imagen = imgMascota;
    }

    try {
      const response = await axios.post(
        "https://tesis-react-backend.vercel.app/api/mascotas",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      setMascota(response.data.mascota);
      if (response.data?.coincidencias.length) {
        setCoincidencias(response.data.coincidencias);
        Swal.fire({
          titleText: `Hemos encontrado ${
            response.data?.coincidencias?.length
          } ${
            response.data?.coincidencias?.length === 1 ? "mascota" : "mascotas"
          } de la misma especie, sexo y localización que ${
            response.data?.mascota?.nombre
              ? response.data?.mascota?.nombre
              : "la tuya"
          }`,
          text: "Al final de la pagina podés ver el listado de coincidencias.",
          icon: "info",
          showConfirmButton: true,
        });
      }
      setSuccess(true);
    } catch (error) {
      console.error("Error:", error);

      setErrors(error.response.data.err.errors);
    }
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

  return (
    <div className="justify-content-center">
      {success ? (
        <>
          <CreadoConExito
            especie={mascota.especie}
            categoria={mascota.categoria}
          />
          <div className="listado-perros coincidencias justify-content-center text-center row">
            {coincidencias && coincidencias.length > 0 && (
              <div className="col-12">
                <div className="col-md-10 mx-auto pb-4">
                  <p>
                    Hemos encontrado las siguientes mascotas cerca de tu
                    ubicación. Podés consultar el listado completo para ver
                    todos los resultados
                  </p>
                </div>
              </div>
            )}

            {coincidencias &&
              coincidencias.map((mascota) => (
                <MascotaListItem key={mascota._id} mascota={mascota} />
              ))}
          </div>
        </>
      ) : (
        <div className="formulario-carga col-12 col-sm-10 col-md-10 col-lg-8 mx-auto">
          <form
            id="form-crear_encontrado"
            onSubmit={handleFormSubmit}
            encType="multipart/form-data"
          >
            <div className="row form_carga justify-content-center seccion-form-carga">
              <div className="col-lg-10">
                <h4>1. Para empezar</h4>
                <CustomInput
                  label="¿Se perdió tu mascota o la encontraste perdida? (obligatorio)"
                  name="categoria"
                  type="select"
                  options={["Perdido", "Encontrado"]}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="row form_carga justify-content-center seccion-form-carga">
              <div className="col-lg-10">
                <h4>2. Datos de la mascota</h4>
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Especie (obligatorio)"
                  name="especie"
                  type="select"
                  options={["Perro", "Gato"]}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Nombre"
                  name="nombre"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Tamaño (obligatorio)"
                  name="tamano"
                  type="select"
                  options={["Chico", "Mediano", "Grande"]}
                  onChange={handleInputChange}
                />{" "}
              </div>

              <div className="col-lg-10">
                <CustomInput
                  label="Sexo (obligatorio)"
                  name="sexo"
                  type="select"
                  options={["Macho", "Hembra"]}
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Edad"
                  name="edad"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Raza"
                  name="raza"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Color"
                  name="color"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Collar"
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
                <p>
                  ¿Nos compartis una foto de tu peludo? Seguro tenés un montón
                  :)
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
                </div>
              </div>
            </div>
            <div className="row form_carga justify-content-center seccion-form-carga">
              <div className="col-lg-10">
                <h4>3. Ubicación y fecha</h4>
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Fecha en la que se perdió o encontró la mascota (obligatorio)"
                  name="fecha"
                  type="date"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Descripción: ¿Cómo se perdió o encontró? (obligatorio)"
                  name="descripcion"
                  type="textarea"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Provincia (obligatorio)"
                  name="provincia"
                  type="select"
                  options={provincias}
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Localidad (obligatorio)"
                  name="municipio"
                  type="select"
                  options={municipios}
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="col-lg-10">
                <CustomInput
                  label="Más detalles del lugar (opcional)"
                  name="zona_perdida"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>
              <div className="mapa col-lg-10 py-4">
                <p>Marcá en el mapa donde se perdió o encontró la mascota</p>
                <GoogleMapComponent setCoordenadas={setCoordenadas} />
              </div>
            </div>
            <div className="row form_carga justify-content-center seccion-form-carga">
              <div className="col-lg-10">
                <h4>4. Datos de contacto</h4>
              </div>

              <div className="col-lg-10">
                <CustomInput
                  label="Celular (obligatorio)"
                  name="celular"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>

              <div className="col-lg-10">
                <CustomInput
                  label="WhatsApp"
                  name="whatsapp"
                  type="text"
                  onChange={handleInputChange}
                />{" "}
              </div>

              <div className="col-lg-10">
                <CustomInput
                  label="Email"
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
                  Crear
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default CrearMascota;
