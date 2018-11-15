import React from 'react';

// Componentes React
import UserCRUDComponent from './UserCRUDComponent.jsx';
import PhenotypesCRUDComponent from './PhenotypesCRUDComponent.jsx';
import PathologiesCRUDComponent from './PathologiesCRUDComponent.jsx';

// Estilos
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'; // Estilos de la tabla

class AdminPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            option: 'users'
        };
    }

    /**
     * Segun la opcion seleccionada, renderizo un componente
     * en especifico
     */
    getComponent() {
        let crudComponent;
        switch (this.state.option) {
            case 'users':
                crudComponent = <UserCRUDComponent />;
                break;
            case 'phenotypes':
                crudComponent = <PhenotypesCRUDComponent />;
                break;
            case 'pathologies':
                crudComponent = <PathologiesCRUDComponent />;
                break;
            default:
                crudComponent = null;
                break;
        }
        return crudComponent;
    }

    render() {
        // Obtnego el componente a renderizar
        let crudComponent = this.getComponent();

        return(
            <div className="container-fluid panel-component">
                <div className="row margin-bottom">
                    <div className="col-12">
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <a className={"nav-link " + (this.state.option == "users" ? 'active' : '')} onClick={() => this.setState({ option: 'users' })} href="#">Usuarios</a>
                            </li>
                            <li className="nav-item">
                                <a className={"nav-link " + (this.state.option == "phenotypes" ? 'active' : '')} onClick={() => this.setState({ option: 'phenotypes' })} href="#">Fenotipos</a>
                            </li>
                            <li className="nav-item">
                                <a className={"nav-link " + (this.state.option == "pathologies" ? 'active' : '')} onClick={() => this.setState({ option: 'pathologies' })} href="#">Patologías</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Tabla dependiendo de la opcion seleccionada */}
                {crudComponent}
            </div>
        );
    }
}

export default AdminPanel;