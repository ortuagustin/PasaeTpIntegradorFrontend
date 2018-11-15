import React from 'react';

// Estilos
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'; // Estilos de la tabla

class AdminPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    componentDidMount() {
        this.getUsers();
    }

    /**
     * Obtiene los usuarios via AJAX
     */
    getUsers() {
        var self = this;
        fetch('http://localhost:8080/admin/users/', {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then((response) => {
            // console.log(response);
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            let responseAns = null;
            try {
                responseAns = response.json();
            } catch (ex) {
                console.log("Ocurrió un error al parsear la respuesta", ex);
            }
            return responseAns;
        })
        .then((usersData) => {
            // Si todo salio bien actualizo el estado
            if (usersData) {
                self.setState({ users: usersData });
            }
        });
    }

    render() {
        const columns = [{
                dataField: 'username',
                text: 'Usuario'
            }, {
                dataField: 'email',
                text: 'Mail'
            }, {
                dataField: 'firstname',
                text: 'Nombre'
            }, {
                dataField: 'lastname',
                text: 'Apellido'
            }
        ];
            
        return(
            <div>
                <h1>Componente del panel de admin</h1>
                {this.users}   
                <BootstrapTable keyField='id' data={this.state.users} columns={columns} />
            </div>
        );
    }
}

export default AdminPanel;