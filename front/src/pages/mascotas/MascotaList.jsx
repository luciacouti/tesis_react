import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { UserContext } from "../user/UserContext";
import MascotaListItem from "./MascotaListItem";
// import "./MascotaList.css";
import CustomInput from "../../microcomponents/CustomInput";
import axios from "axios";
import { LoadStart, LoadRemove } from "../../microcomponents/Loading";

function MascotasList({ categoria, account }) {
  const [mascotas, setMascotas] = useState([]);
  const [mascotasAll, setMascotasAll] = useState([]);
  const [filtros, setFiltros] = useState({});
  const [filtroNombre, setFiltroNombre] = useState("");
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const itemsPerPage = 12;
  const [isSidebarVisible, setSidebarVisible] = useState(
    window.innerWidth > 768
  );
  const [isLoading, setIsLoading] = useState(false);

  // Estado inicial de los filtros
  const [initialFiltros, setInitialFiltros] = useState({});

  const [hasLoadedData, setHasLoadedData] = useState(false); // Nuevo estado para rastrear si los datos ya han sido intentados de cargar
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Guardar el estado inicial de los filtros
  useEffect(() => {
    setInitialFiltros(filtros);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mascotas.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(mascotas.length / itemsPerPage);

  const handleClick = (event, page) => {
    event.preventDefault();
    setCurrentPage(page);
  };

  const cambiarFiltro = async (categoria, account) => {
    setIsLoading(true); // Asegúrate de que el loader se muestre al inicio
    setHasAttemptedLoad(true); // Indica que se ha intentado cargar los datos

    setHasLoadedData(true); // Marcar que se ha intentado cargar los datos
    const filtro = categoria ? `categoria=${categoria}` : "";
    const filtro2 = account ? `account=${account}` : "";
    try {
      const response = await fetch(
        `https://tesis-react-backend.vercel.app/api/mascotas?${filtro}&${filtro2}`
      );
      const data = await response.json();
      const mascotasOrdenadas = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );
      setMascotasAll(mascotasOrdenadas);
      setMascotas(mascotasOrdenadas);
    } catch (error) {
      console.error("Error al cargar las mascotas:", error);
    } finally {
      setIsLoading(false); // Asegúrate de que el loader se oculte al final
    }
  };

  const aplicarFiltros = () => {
    let mascotasFiltradas = mascotasAll.filter((mascota) => {
      const nombreCoincide =
        !filtroNombre ||
        mascota.nombre?.toLowerCase().includes(filtroNombre.toLowerCase());
      const sexoCoincide =
        !filtros.sexo ||
        mascota.sexo.toLowerCase() === filtros.sexo.toLowerCase();
      const especieCoincide =
        !filtros.especie ||
        mascota.especie.toLowerCase() === filtros.especie.toLowerCase();
      const tamanioCoincide =
        !filtros.tamanio ||
        mascota.tamano.toLowerCase() === filtros.tamanio.toLowerCase();
      const collarCoincide =
        !filtros.collar || mascota.collar === filtros.collar;
      const provinciaCoincide =
        !filtros.provincia || mascota?.provincia === filtros.provincia;
      const municipioCoincide =
        !filtros.municipio || mascota?.municipio === filtros.municipio;
      const fechaCoincide =
        !selectedDate || new Date(mascota.fecha) > new Date(selectedDate);

      return (
        nombreCoincide &&
        sexoCoincide &&
        especieCoincide &&
        tamanioCoincide &&
        collarCoincide &&
        provinciaCoincide &&
        municipioCoincide &&
        fechaCoincide
      );
    });

    setMascotas(mascotasFiltradas);
  };

  const onChangeFilter = (event) => {
    setFiltroNombre(event.target.value);
  };

  const onCheckboxChange = (event) => {
    const { name, value } = event.target;
    setFiltros({ ...filtros, [name]: value == filtros[name] ? "" : value });
    aplicarFiltros();
  };

  const handleInputChange = (name, value) => {
    setFiltros({ ...filtros, [name]: value == filtros[name] ? "" : value });
    aplicarFiltros();
  };

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);

    // Limpiar el controlador de eventos cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const getProvincias = async () => {
      const { data } = await axios.get(
        "https://apis.datos.gob.ar/georef/api/provincias"
      );
      const provinciasNombre = data.provincias.map((prov) => prov.nombre);
      setProvincias(provinciasNombre);
    };
    LoadStart();
    //aca va a ir el init loader
    setIsLoading(true);

    cambiarFiltro(categoria, account);
    getProvincias().finally(() => {
      //aca va a ir el finally loader
      setIsLoading(false);
      LoadRemove();
    });
  }, [categoria, account]);

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

    // LoadStart();

    if (filtros.provincia) {
      getMunicipios(filtros.provincia);
    }

    getMunicipios().finally(() => {
      //aca va a ir el finally loader
      setIsLoading(false);
      // LoadRemove();
    });
  }, [categoria, account, filtros.provincia]);

  useEffect(() => {
    // LoadStart();
    aplicarFiltros();
    LoadRemove();
  }, [filtroNombre, filtros, selectedDate]);

  const { userData } = useContext(UserContext);

  const getButtonClassName = (name) => {
    switch (name) {
      case "perros":
        return filtros.especie === "Perro" ? "bg-1 active" : "bg-1";
      case "gatos":
        return filtros.especie === "Gato" ? "bg-1 active" : "bg-1";
      case "machos":
        return filtros.sexo === "Macho" ? "bg-1 active" : "bg-1";
      case "hembras":
        return filtros.sexo === "Hembra" ? "bg-1 active" : "bg-1";
      case "chicos":
        return filtros.tamanio === "Chico" ? "bg-1 active" : "bg-1";
      case "medianos":
        return filtros.tamanio === "Mediano" ? "bg-1 active" : "bg-1";
      case "grandes":
        return filtros.tamanio === "Grande" ? "bg-1 active" : "bg-1";
      case "Tiene collar con chapita":
        return filtros.collar === "Tiene collar con chapita"
          ? "bg-1 active"
          : "bg-1";
      case "Tiene collar sin chapita":
        return filtros.collar === "Tiene collar sin chapita"
          ? "bg-1 active"
          : "bg-1";
      case "No tiene collar":
        return filtros.collar === "No tiene collar" ? "bg-1 active" : "bg-1";
      default:
        return "";
    }
  };

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setFiltros(initialFiltros);
    setFiltroNombre("");
    setSelectedDate(null);
    // Asegúrate de limpiar también los campos de selección de provincia y municipio si es necesario
  };

  return (
    <div>
      {isLoading ? (
        <LoadStart />
      ) : (
        <div className="mascota-list container-fluid">
          <header className="text-center col-12 titulo-seccion mx-auto pb-0">
            <h2 className="titulo-listado">
              <span className="light lowercase">Listado de</span> mascotas{" "}
              {categoria ? categoria.toLowerCase().slice(0, -1) + "as" : ""}
            </h2>
          </header>

          <section className="row justify-content-center justify-content-md-between text-center container-filtros px-md-1 px-lg-2 px-xxl-5 pt-0">
            {/* <div className="col-12 col-md-9 px-0">
          <form className="mascota-list__form">
            Buscar:{" "}
            <input
              id="filtro"
              className="mascota-list__filter"
              type="text"
              onInput={onChangeFilter}
              placeholder="Escribí el nombre de la mascota"
            />
          </form>
        </div> */}

            {userData && userData._id ? (
              <div className="col-4 col-md-3">
                <Link
                  className="btn btn-azul d-none d-md-block"
                  to="/mascotas/nuevo"
                >
                  Agregar mascota
                </Link>

                <Link
                  className="btn btn-azul btn-flotante d-md-none"
                  to="/mascotas/nuevo"
                >
                  <i className="bi bi-plus"></i>
                </Link>
              </div>
            ) : (
              <div className="col-4 col-md-3 col-lg-2">
                <Link className="btn btn-azul d-none d-md-block" to="/login">
                  Agregar
                </Link>

                <Link
                  className="btn btn-azul btn-flotante d-md-none"
                  to="/login"
                >
                  <i className="bi bi-plus"></i>
                </Link>
              </div>
            )}

            <div className="col-12 py-3">
              <div className="container-fluid">
                <div className="row justify-content-center">
                  <div className="d-md-none text-left">
                    <button
                      className="btn-toggle-filtros"
                      onClick={() => setSidebarVisible(!isSidebarVisible)}
                    >
                      Filtrar <i class="bi bi-chevron-down"></i>
                    </button>
                  </div>

                  <div
                    className={`col-12 col-md-3 barra-filtros align-items-center justify-content-center py-4 text-left ${
                      isSidebarVisible ? "sidebar-visible" : "sidebar-hidden"
                    }`}
                  >
                    <p className="filtros-title mb-1">Filtros de búsqueda</p>
                    <div className="btn-limpiar mb-4">
                      <button onClick={limpiarFiltros}>Limpiar filtros</button>
                    </div>
                    <div className="px-0 pb-4">
                      <form className="mascota-list__form">
                        Buscar{" "}
                        <input
                          id="filtro"
                          className="mascota-list__filter"
                          type="text"
                          onInput={onChangeFilter}
                          placeholder="Escribí el nombre de la mascota"
                        />
                      </form>
                    </div>
                    <div className="filter-container text-left pb-4">
                      <p>Especie</p>
                      <div className="btns-filters d-flex flex-wrap">
                        <div className="botones-choice">
                          <label className={getButtonClassName("perros")}>
                            <input
                              type="checkbox"
                              name="especie"
                              value={"Perro"}
                              onChange={onCheckboxChange}
                            />
                            Perros
                          </label>
                        </div>
                        <div className="botones-choice px-2">
                          <label className={getButtonClassName("gatos")}>
                            <input
                              type="checkbox"
                              name="especie"
                              value={"Gato"}
                              onChange={onCheckboxChange}
                            />
                            Gatos
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="filter-container text-left pb-4">
                      <p>Ubicación</p>
                      <div className="overflow-hidden btns-filters d-flex flex-wrap select-provincias-filtro py-1 pl-4px">
                        <label>Provincia </label>
                        <CustomInput
                          name="provincia"
                          type="select"
                          options={provincias}
                          onChange={handleInputChange}
                        />{" "}
                      </div>
                      <div className="overflow-hidden btns-filters flex-wrap select-provincias-filtro py-1 pl-4px">
                        <label>Localidad </label>
                        <CustomInput
                          name="municipio"
                          type="select"
                          options={municipios}
                          onChange={handleInputChange}
                        />{" "}
                      </div>
                    </div>
                    <div className="filter-container text-left pb-4">
                      <p>Fecha</p>
                      <div className="overflow-hidden btns-filters flex-wrap select-provincias-filtro py-1">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="filter-container text-left pb-4">
                      <p>Sexo</p>
                      <div className="btns-filters d-flex flex-wrap">
                        <div className="botones-choice pr-1 pb-2">
                          <label className={getButtonClassName("machos")}>
                            <input
                              type="checkbox"
                              name="sexo"
                              value={"Macho"}
                              onChange={onCheckboxChange}
                            />
                            Machos
                          </label>
                        </div>
                        <div className="botones-choice px-1 pb-2">
                          <label className={getButtonClassName("hembras")}>
                            <input
                              type="checkbox"
                              name="sexo"
                              value={"Hembra"}
                              onChange={onCheckboxChange}
                            />
                            Hembras
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="filter-container text-left pb-4">
                      <p>Tamaño</p>
                      <div className="btns-filters d-flex flex-wrap">
                        <div className="botones-choice pr-2 pb-2">
                          <label className={getButtonClassName("chicos")}>
                            <input
                              type="checkbox"
                              name="tamanio"
                              value="Chico"
                              onChange={onCheckboxChange}
                            />
                            Chicos
                          </label>
                        </div>
                        <div className="botones-choice pr-2 pb-2">
                          <label className={getButtonClassName("medianos")}>
                            <input
                              type="checkbox"
                              name="tamanio"
                              value="Mediano"
                              onChange={onCheckboxChange}
                            />
                            Medianos
                          </label>
                        </div>
                        <div className="botones-choice pr-2">
                          <label className={getButtonClassName("grandes")}>
                            <input
                              type="checkbox"
                              name="tamanio"
                              value="Grande"
                              onChange={onCheckboxChange}
                            />
                            Grandes
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="filter-container text-left pb-4">
                      <p>Collar</p>
                      <div className="btns-filters d-flex flex-wrap">
                        <div className="botones-choice pr-2 pb-2">
                          <label
                            className={getButtonClassName(
                              "Tiene collar con chapita"
                            )}
                          >
                            <input
                              type="checkbox"
                              name="collar"
                              value="Tiene collar con chapita"
                              onChange={onCheckboxChange}
                            />
                            Con collar (chapa)
                          </label>
                        </div>
                        <div className="botones-choice pr-2 pb-2">
                          <label
                            className={getButtonClassName(
                              "Tiene collar sin chapita"
                            )}
                          >
                            <input
                              type="checkbox"
                              name="collar"
                              value="Tiene collar sin chapita"
                              onChange={onCheckboxChange}
                            />
                            Con collar (sin chapa)
                          </label>
                        </div>
                        <div className="botones-choice pr-2 pb-2">
                          <label
                            className={getButtonClassName("No tiene collar")}
                          >
                            <input
                              type="checkbox"
                              name="collar"
                              value="No tiene collar"
                              onChange={onCheckboxChange}
                            />
                            Sin collar
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* <div className="filter-container text-left pb-4">
                  <p>Ubicacion</p>
                  <GoogleMapComponent />
                </div> */}
                  </div>

                  <div className="col-md-9 listado-perros px-0 px-lg-3 px-xl-4 px-xxl-5 py-3">
                    {mascotas.length === 0 && hasAttemptedLoad ? (
                      <div className="no-results txt-center">
                        <p>
                          ¡Lo sentimos! Todavía no hay resultados para mostrar
                        </p>
                        <div className="img-sorry">
                          <img
                            src="https://res.cloudinary.com/huellasacasa/image/upload/v1708899250/huellasacasa/jtxzs8ejiqu2miyhygqi.png"
                            alt=""
                            className="img-fluid"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="perrosencontrados row mascota-list__list px-xxl-5">
                        {[...currentItems]
                          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                          .map((mascota) => (
                            <MascotaListItem
                              key={mascota._id}
                              mascota={mascota}
                              account={account}
                            />
                          ))}

                        {/* Renderiza los enlaces de paginación */}
                        <div className="col-12 mx-auto botones-paginacion">
                          {[...Array(totalPages)].map((e, i) => (
                            <button
                              key={i}
                              onClick={(event) => {
                                handleClick(event, i + 1);
                                window.scrollTo(0, 0); // Añade esta línea
                              }}
                              className={
                                currentPage === i + 1
                                  ? "btn btn-naranja"
                                  : "btn btn-naranja-outline"
                              }
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MascotasList;

MascotasList.propTypes = {
  categoria: PropTypes.string,
  account: PropTypes.string,
};
