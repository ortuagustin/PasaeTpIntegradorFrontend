// Librerias
import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Route,
	Link
} from 'react-router-dom'

// Componentes
import Home from './Home.jsx';
import AdminPanel from './AdminPanel.jsx';
import ProfessionalPanel from './ProfessionalPanel.jsx';

// Estilos
import '../css/style.css'; // Estilos propios
import '../css/bootstrap.min.css'; // Bootstrap

/**
 * Componente principal
 */
class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
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
								<li className="nav-item active">
									<a className="nav-link">
										<div>
											<Link to="/">Home</Link>
										</div>
									</a>
								</li>
								<li className="nav-item active">
									<a className="nav-link">
										<div>
											<Link to="/admin">Admin</Link>
										</div>
									</a>
								</li>
								<li className="nav-item active">
									<a className="nav-link">
										<div>
											<Link to="/professional">Profesional</Link>
										</div>
									</a>
								</li>
							</ul>
						
							{/* Boton de logout */}
							<a href="logout">
								<button className="btn btn-outline-success my-2 my-sm-0">Salir</button>
							</a>
						</div>
					</nav>

					{/* Renderiza los componentes seleccionados */}
					<Route exact path="/" component={Home} />
					<Route exact path="/admin" component={AdminPanel} />
					<Route exact path="/professional" component={ProfessionalPanel} />
				</div>
			</Router>
		);
	}	
}

ReactDOM.render(
	<App />,
	document.getElementById('react')
)

