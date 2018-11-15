// Librerias
import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'
import 'bootstrap'; // Para los modals

// Componentes
import HomePanel from './home/HomePanel.jsx';
import AdminPanel from './admin/AdminPanel.jsx';
import RegisterPanel from './register/RegisterPanel.jsx';
import ScientistPanel from './scientist/ScientistPanel.jsx';
import ClinicalDoctorPanel from './clinical_doctor/ClinicalDoctorPanel.jsx';
import AboutUsPanel from './about_us/AboutUsPanel.jsx';
import { Login } from './login/Login.jsx';

// Estilos
import '../css/style.css'; // Estilos propios'
import '../css/bootstrap.min.css'; // Bootstrap

/**
 * Componente principal
 */
class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			user: null
		};

		// Bindeo la variable 'this' para poder llamar al metodo desde el Login
		this.getCurrentUser = this.getCurrentUser.bind(this);
		this.logout = this.logout.bind(this);
		this.userHasRole = this.userHasRole.bind(this);
	}

	/**
	 * Funcion que se llama antes de montar
	 */
	componentWillMount() {
		this.getCurrentUser();
	}

	logout() {
		let self = this;
		$.ajax({
			url: 'http://localhost:8080/logout',
		}).done(function () {
			self.getCurrentUser(); // Actualizo el estado del usuario
		}).fail(function (jqXHR, textStatus, errorThrown) {
			console.log("Error al desloguearse -> ", jqXHR, textStatus, errorThrown);
		}).always(function () {
			self.setState({ loading: false });
		});
	}

	/**
	 * Chequea si el usuario actual tiene el permiso
	 * especificado
	 * @param {string[]} authorities Arreglo de permisos a chequear
	 * @returns {boolean} True si tiene el permiso necesario. False caso contrario
	 */
	userHasRole(authorities) {
		return this.state.user
			&& this.state.user.authorities
			// Por cada permiso que posee mi usuario actual, me fijo si hay un permiso solicitad
			&& this.state.user.authorities.some( (authorityObj) => authorities.some((authority) => authorityObj.authority == authority) );
	}

	/**
	 * Devuelve el componente Router con el menu principal
	 */
	getRouterComponent() {
		return (
			<Router>
				<div>
					<nav className="navbar navbar-expand-lg navbar-light bg-light">
						<a className="navbar-brand" href="#">PASAE</a>
						<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
							<span className="navbar-toggler-icon"></span>
						</button>

						<div className="collapse navbar-collapse" id="navbarSupportedContent">
							<ul className="navbar-nav mr-auto">

								{/* Home, cualquiera puede verla */}
								<li className="nav-item active">
									<span className="nav-link">
										<div>
											<Link to="/app/">Home</Link>
										</div>
									</span>
								</li>

								{/* Panel del administrador */}
								{this.userHasRole(['ADMIN']) &&
									<li className="nav-item active">
										<span className="nav-link">
											<div>
												<Link to="/app/admin">Admin</Link>
											</div>
										</span>
									</li>
								}

								{/* Panel de registrante */}
								{this.userHasRole(['ADMIN', 'REGISTER']) &&
									<li className="nav-item active">
										<span className="nav-link">
											<div>
												<Link to="/app/register">Registrante</Link>
											</div>
										</span>
									</li>
								}

								{/* Panel de cientifico */}
								{this.userHasRole(['ADMIN', 'SCIENTIST']) &&
									<li className="nav-item active">
										<span className="nav-link">
											<div>
												<Link to="/app/scientist">Científico</Link>
											</div>
										</span>
									</li>
								}

								{/* Panel de medico clinico */}
								{this.userHasRole(['ADMIN', 'CLINICAL_DOCTOR']) &&
									<li className="nav-item active">
										<span className="nav-link">
											<div>
												<Link to="/app/clinical-doctor">Médico clínico</Link>
											</div>
										</span>
									</li>
								}

								{/* Seccion sobre acerca de nosotros */}
								<li className="nav-item active">
									<span className="nav-link">
										<div>
											<Link to="/app/about">Acerca de nosotros</Link>
										</div>
									</span>
								</li>
							</ul>

							{/* Boton de logout */}
							<button className="btn btn-outline-success my-2 my-sm-0" onClick={this.logout}>Salir</button>
						</div>
					</nav>

					{/* Renderiza los componentes seleccionados */}
					<div>
						<Route exact path="/app/" component={HomePanel} />
						<Route exact path="/app/admin" component={AdminPanel} />
						<Route
							exact
							path="/app/register"
							component={(props) => <RegisterPanel {...props} currentUserId={this.state.user.id} />}
						/>
						<Route exact path="/app/scientist" component={ScientistPanel} />
						<Route exact path="/app/clinical-doctor" component={ClinicalDoctorPanel} />
						<Route exact path="/app/about" component={AboutUsPanel} />
					</div>
				</div>
			</Router>
		);
	}

	/**
	 * Obtiene los datos del usuario actual
	 */
	getCurrentUser() {
		let self = this;
		$.ajax({
			url: 'http://localhost:8080/currentUser',
		}).done(function (jsonResponse) {
			if (jsonResponse && jsonResponse.id) {
				self.setState({ user: jsonResponse });
			}
		}).fail(function (jqXHR, textStatus, errorThrown) {
			// Si el codigo de error es un 403, significa que no hay
			// una sesion iniciada
			if (jqXHR.status == 403) {
				console.log("El usuario no se encuentra logueado");
				self.setState({ user: null });
			} else {
				alert("Ocurrió un error al cargar la página. Intente nuevamente más tarde");
				console.log("Error al obtener al usuario actual -> ", jqXHR, textStatus, errorThrown);
			}
		}).always(function() {
			self.setState({ loading: false });
		});
	}

	render() {
		// Si esta obteniendo el usuario actual, muestra un aviso
		if (this.state.loading) {
			return (
				<p>Cargando, aguarde un momento</p>
			);
		}

		// Obtengo el componente correspondiente de acuerdo a si
		// esta logueado o no
		let mainComponent = null; // Componente principal a renderizar

		if (this.state.user) {
			// Si esta logueado muestro el menu
			mainComponent = this.getRouterComponent();
		} else {
			// Sino muestro el login
			mainComponent = (
				<Login
					getCurrentUser={this.getCurrentUser}
				/>
			);
		}

		return mainComponent;
	}
}

// Configuro AJAX para que envie las credenciales
$.ajaxSetup({
	xhrFields: {
		withCredentials: true
	}
});


// Renderizo la App principal
ReactDOM.render(
	<App />,
	document.getElementById('react')
)

