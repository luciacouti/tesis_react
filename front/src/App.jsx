import { Outlet, Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react"; // Importa useEffect y useRef
import { AuthContext } from "./pages/user/AuthContext";
import { Collapse, Navbar, Nav } from "react-bootstrap";

import "minireset.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";

import appLogo from "./assets/img/logo_horizontal.png";

import "./App.css";

export function App() {
  const [open, setOpen] = useState(false);
  const { token } = useContext(AuthContext);
  const navbarRef = useRef(null); // Referencia al navbar

  // Función para colapsar el navbar
  const collapseNavbar = () => {
    const navbar = navbarRef.current;
    if (navbar) {
      navbar.classList.remove("show"); // Esto colapsa el navbar
    }
  };

  useEffect(() => {
    // // Función para colapsar el navbar
    // const collapseNavbar = () => {
    //   const navbar = navbarRef.current;
    //   if (navbar) {
    //     navbar.classList.remove("show"); // Esto colapsa el navbar
    //   }
    // };

    // Agregar el controlador de eventos para el clic fuera del navbar
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        collapseNavbar();
      }
    };

    // Agregar el controlador de eventos para los enlaces del navbar
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", collapseNavbar);
    });

    // Agregar el controlador de eventos para el clic fuera del navbar
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar los controladores de eventos al desmontar el componente
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      navLinks.forEach((link) => {
        link.removeEventListener("click", collapseNavbar);
      });
    };
  }, []);

  return (
    <div className="App">
      <header id="header" className="fixed-top mb-5">
        <Navbar className="navbar navbar-expand-lg py-0 px-md-4" expand="lg">
          <div className="container-fluid">
            <Link to="/">
              <div className="logo mx-auto mx-lg-1 mr-lg-auto">
                <img
                  src={appLogo}
                  alt="Logo Huellas a casa"
                  className="img-fluid"
                  id="logo-header"
                />
              </div>
              <h1 className="d-none">Huellas a Casa</h1>
            </Link>
            <Navbar.Toggle
              aria-controls="responsive-navbar-nav"
              onClick={() => setOpen(!open)}
            />
            <Collapse in={open} id="responsive-navbar-nav">
              <Nav className="mr-auto nav-menu">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link to="/" onClick={() => setOpen(false)}>
                      Inicio
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/mascotas/perdidos"
                      onClick={() => setOpen(false)}
                    >
                      Perdidos
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/mascotas/encontrados"
                      onClick={() => setOpen(false)}
                    >
                      Encontrados
                    </Link>
                  </li>
                  {/* Agrega aquí los demás enlaces */}
                </ul>
                <ul className="navbar-nav justify-content-center ml-auto mb-2 mb-lg-0">
                  {token ? (
                    <>
                      <li className="nav-item">
                        {" "}
                        <Link to="/profile" onClick={() => setOpen(false)}>
                          Cuenta
                        </Link>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <Link to="/logout" onClick={() => setOpen(false)}>
                          Cerrar sesión
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="nav-item">
                        {" "}
                        <Link to="/register" onClick={() => setOpen(false)}>
                          Registrate
                        </Link>
                      </li>
                      <li className="nav-item">
                        {" "}
                        <Link to="/login" onClick={() => setOpen(false)}>
                          Iniciar sesión
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </Nav>
            </Collapse>
          </div>
        </Navbar>
      </header>
      <Outlet />

      {/* <script
        src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"
        integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"
        integrity="sha384-fbbOQedDUMZZ5KreZpsbe1LCZPVmfTnH7ois6mU1QK+m14rQ1l2bGBq41eYeM/fS"
        crossOrigin="anonymous"
      ></script> */}
      <footer className="footer text-white mt-5 p-lg-4">
        <div className="container pt-4">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <div className="mr-3">
                Copyright© {new Date().getFullYear()} HUELLAS A CASA
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <p className="mb-0 text-white">
                <i class="bi bi-envelope-fill px-1"></i> huellasacasa@gmail.com
              </p>
              <p className="mb-0 text-white">
                <i class="bi bi-telephone-fill px-1"></i> +54 9 11 3865 4651
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
