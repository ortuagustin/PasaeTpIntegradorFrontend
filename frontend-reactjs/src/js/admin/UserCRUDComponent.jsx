import React from 'react';

// Librerias
import BootstrapTable from 'react-bootstrap-table-next'; // Tabla
import paginationFactory from 'react-bootstrap-table2-paginator'; // Paginacion en tabla
import overlayFactory from 'react-bootstrap-table2-overlay'; // Para la animacion de carga
import filterFactory from 'react-bootstrap-table2-filter'; // Para filtrar los usuarios

// Componentes
import AddUserModal from './AddUserModal.jsx';
import DeleteUserModal from './DeleteUserModal.jsx';

// Funciones
import { actionModal } from '../functions_util';

// Iconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'

/**
 * Componente que renderiza el panel de CRUD de usuarios
 */
class UserCRUDComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            page: 1,
            sizePerPage: 10,
            totalSize: 0,
            selectedUser: {},
            action: null,
            searchUserInput: ''
        }

        // Variables que no renderizan la vista
        this.addUserModalId = 'add-user-modal';
        this.deleteUserModalId = 'delete-user-modal';

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getUsers = this.getUsers.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando termina de 
     * renderizar el componente
     */
    componentDidMount() {
        this.getUsers();
    }

    /**
     * Obtiene los usuarios via AJAX.
     * Para mas info acerca de los parametros: https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/table-props.html#ontablechange-function
     * @param {string} type Tipo de accion realizada en la tabla 
     * @param {*} newState Atributos de la tabla actuales
     */
    getUsers(actionType = '', newState = {}) {
        let self = this;
        // Genero los parametros del request
        let pageNumber = newState.page ? newState.page : self.state.page;
        let sizePerPage = newState.sizePerPage ? newState.sizePerPage : self.state.sizePerPage;

        self.setState({ loading: true });
        $.ajax({
            url: 'http://localhost:8080/admin/users/',
            data: {
                newestPage: pageNumber - 1,
                newestSizePerPage: sizePerPage,
                newestSortField: newState.sortField,
                newestSortOrder: newState.sortOrder,
                search: self.state.searchUserInput
            }
        }).done(function (jsonReponse, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                self.setState({
                    users: jsonReponse.content,
                    page: pageNumber,
                    sizePerPage: jsonReponse.size,
                    totalSize: jsonReponse.totalElements
                });
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }).always(function () {
            self.setState({ loading: false });
        });
    }

    /**
     * Cambia el estado de la accion que estamos realizando
     * (agregando o editando un usuario) para poder reutilizar
     * el modal de alta de usuario
     * @param {string} action 'add' o 'edit' para el modal
     */
    changeAction(action) {
        this.setState({ action: action }, () => {
            // Una vez que cambiamos de accion, abrimos el modal de alta/edicion
            actionModal(this.addUserModalId, 'show');
        });
    }

    /**
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            this.getUsers();
        });;
    }

    /**
     * Selecciona el usuario actual y ejecuta una accion
     * @param {*} user Usuario a seleccionar 
     * @param {*} action Editar | Eliminar el usuario seleccionado
     */
    selectAndAction(user, action) {
        this.setState({ selectedUser: user }, () => {
            if (action == 'edit') {
                this.changeAction('edit')
            } else {
                actionModal(this.deleteUserModalId, 'show');
            }
        });
    }

    render() {
        const columns = [
            {
                dataField: 'username',
                text: 'Usuario',
                sort: true,
            }, {
                dataField: 'email',
                text: 'Mail',
                sort: true
            }, {
                dataField: 'firstName',
                text: 'Nombre',
                sort: true
            }, {
                dataField: 'lastName',
                text: 'Apellido',
                sort: true
            }, {
                dataField: 'authorities',
                text: 'Rol',
                sort: true,
                formatter: (cell, row, rowIndex, formatExtraData) => {
                    return cell.map(function (role) {
                        return role.name;
                    }).join(", ");
                }
            },
            {
                dataField: 'noField',
                text: 'Acciones',
                formatter: (cell, row) => {
                    return (
                        <div>
                            <span className="animated-ease-1seg yellow-hover" title="Editar" onClick={() => this.selectAndAction(row, 'edit')}>
                                <FontAwesomeIcon icon={faEdit} />
                            </span>
                            <span className="margin-left animated-ease-1seg red-hover" title="Eliminar" onClick={() => this.selectAndAction(row, 'delete')}>
                                <FontAwesomeIcon icon={faTimes} />
                            </span>
                        </div>
                    );
                }
            }
        ];

        // Seteos de paginacion
        let paginationOptions = {
            page: this.state.page,
            sizePerPage: this.state.sizePerPage,
            totalSize: this.state.totalSize,
            sizePerPageList: [
                { text: '10', value: 10 },
                { text: '15', value: 15 },
                { text: '30', value: 30 }
            ],
            prePageText: 'Anterior',
            nextPageText: 'Siguiente'
        };
    
        return (
            <div>
                <div className="row">
                    <div className="col-9 button-col">
                        <h4>Acciones</h4>
                        <button type="button" className="btn btn-success" onClick={() => this.changeAction('add')}>Agregar</button>
                    </div>
                    <div className="col-3 button-col">
                        <div className="form-group">
                            <label htmlFor="search-user-input"><h5>Buscar</h5></label>
                            <input type="text"
                                className="form-control"
                                name="searchUserInput"
                                value={this.state.searchUserInput}
                                onChange={this.handleChange}
                                aria-describedby="searchHelpBlockUsers" />
                            <small id="searchHelpBlockUsers" className="form-text text-muted">
                                Buscará por username, nombre y apellido
                                </small>
                        </div>
                    </div>
                </div>
                <div id="admin-panel" className="row">
                    <div className="col-12">
                        <h4>Usuarios</h4>
                        <BootstrapTable
                            remote={{ pagination: true, filter: true }}
                            keyField='id'
                            data={this.state.users}
                            columns={columns}
                            noDataIndication="No hay información para mostrar"
                            onTableChange={this.getUsers}
                            pagination={
                                paginationFactory(paginationOptions)
                            }
                            filter={filterFactory()}
                            loading={this.state.loading}
                            rowClasses="cursor-pointer"
                            overlay={
                                overlayFactory({
                                    spinner: true,
                                    background: 'rgba(192,192,192,0.3)'
                                })
                            } // Animacion mientras carga
                        />
                    </div>
                </div>

                {/* Modal de alta de usuario */ }
                <AddUserModal
                    modalId={this.addUserModalId}
                    action={this.state.action}
                    selectedUser={this.state.selectedUser}
                    getUsers={this.getUsers}
                />

                {/* Modal de confirmacion de eliminacion de usuario */ }
                <DeleteUserModal
                    modalId={this.deleteUserModalId}
                    userId={this.state.selectedUser.id}
                    username={this.state.selectedUser.username}
                    getUsers={this.getUsers}
                />
            </div>
        );
    }
}

export default UserCRUDComponent;