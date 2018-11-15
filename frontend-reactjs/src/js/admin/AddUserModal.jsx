import React from 'react';

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modal con los campos de alta de un usuario
 * @param {string} modalId Id del modal
 * @param {string} action Para saber si se esta agregando o eliminando un usuario
 * @param {*} selectedUser Si action == 'edit' se utiliza para cargar los datos del usuario a editar
 * @param {Function} getUsers Funcion para refrescar la tabla
 */
class AddUserModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            email: '',
            firstname: '',
            lastname: '',
            selectedRoles: new Set(),
            roles: [],
            adding: false
        };

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.saveUser = this.saveUser.bind(this);
    }

    /**
     * Metodo que se ejecuta cuando los inputs cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handleChange(e) {
        // Verifico que el formulario sea valido
        if (!e.target.validity.valid) {
            return;
        }

        // Modifico
        this.setState({ [e.target.name]: e.target.value });
    }

    /**
     * Hace un toggle de un checkbox en particular
     * @param {string} roleName Nombre del rol que estamos seleccionando/deseleccionando
     */
    toggleCheckbox(roleName) {
        let selectedRoles = this.state.selectedRoles;
        if (selectedRoles.has(roleName)) {
            selectedRoles.delete(roleName);
        } else {
            selectedRoles.add(roleName);
        }
        this.setState({ selectedRoles });
    }

    /**
     * Limpia todos los inputs del formulario
     */
    cleanInputs() {
        this.setState({
            username: '',
            password: '',
            email: '',
            firstname: '',
            lastname: '',
            selectedRoles: new Set(),
            roles: [],
            adding: false
        });
    }

    /**
     * Ni bien se renderiza el componente pedimos los roles
     * al servidor
     */
    componentDidMount() {
        let self = this;
        // Cada vez que se abra el modal, obtengo los roles
        $('#' + self.props.modalId).on('show.bs.modal', function() {
            self.getRoles();
            if (self.props.action == 'edit') {
                // Si estamos editando, cargo los datos del usuario
                // seleccionado en el formulario
                // console.log(self.props.selectedUser);
                let authorities = self.props.selectedUser.authorities.map(authority => authority.name); // Me quedo solo con los nombres
                self.setState({
                    username: self.props.selectedUser.username,
                    password: self.props.selectedUser.password,
                    email: self.props.selectedUser.email,
                    firstname: self.props.selectedUser.firstName,
                    lastname: self.props.selectedUser.lastName,
                    selectedRoles: new Set(authorities),
                });
            }
        });

        // Cuando ya esta abierto el modal, hago focus en el
        // primer input
        $('#' + self.props.modalId).on('shown.bs.modal', function() {
            $('#username-input').focus();
        });

        // Cuando se esconde limpio los inputs
        $('#' + self.props.modalId).on('hidden.bs.modal', function() {
            self.cleanInputs();
        });
    }

    /**
     * Maneja el evento cuando se presiona una tecla en el
     * formualario
     * @param {Event} e Evento de la presion de la tecla
     */
    handleKeyPress(e) {
        // Si presiona enter hacemos el submit
        if (e.which == 13) {
            this.saveUser();
        }
    }

    /**
     * Hace un request al server para agregar un usuario
     */
    saveUser() {
        let self = this;
        // Si el formulario es invalido no hago nada
        if (!self.isFormValid()) {
            return;
        }

        let idUser = self.props.action == 'edit' ? self.props.selectedUser.id : ''; // Id para editar el usuario
        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/admin/users/' + idUser,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: self.props.action == 'add' ? 'PUT' : 'PATCH',
            data: JSON.stringify({
                username: self.state.username,
                password: self.state.password,
                email: self.state.email,
                firstName: self.state.firstname,
                lastName: self.state.lastname,
                authorities: [...self.state.selectedRoles] // Con los 3 puntos suspensivos convierto el set en un array
            })
        }).done(function () {
            self.props.getUsers(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al " + (self.props.action == 'add' ? 'dar de alta' : 'editar el usuario') + ". Intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
    * Obtiene via AJAX los roles disponibles para el
    * alta de un usuario
    */
    getRoles() {
        let self = this;
        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/admin/roles/',
        }).done(function (jsonReponse, textStatus, jqXHR) {
            if (jqXHR.status == 200) {
                self.setState({ roles: jsonReponse });
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al obtener los roles. Cierre e intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
     * Valida el formulario
     * @returns True si el formulario es valido, false caso contrario
     */
    isFormValid() {
        return !this.state.adding
                && this.state.username
                && this.state.email
                && this.state.firstname
                && this.state.lastname
                && this.state.selectedRoles.size > 0
                // Si esta agregando necesito la pass.
                // Si esta editando, no es necesaria
                && (
                    this.props.action == 'edit'
                    || (
                        this.props.action == 'add'
                        && this.state.password
                    )
                );
    }

    render() {
        // Armo una lista con los roles disponibles
        let rolesList = this.state.roles.map((rol, idx) => {
            return (
                <div key={"input-role-div-" + rol.id} className="custom-control custom-checkbox custom-control-inline">
                    <input key={"input-role-" + rol.id}
                        id={"rol-" + rol.id}
                        className="custom-control-input"
                        type="checkbox"
                        checked={this.state.selectedRoles.has(rol.name)}
                        onChange={() => this.toggleCheckbox(rol.name)}/>
                    <label key={"input-role-label-" + rol.id} className="custom-control-label" htmlFor={"rol-" + rol.id}>{rol.name}</label>
                </div>
            );
        });

        // Verifico que no este cargando y que el formulario sea valido
        let isValid = this.isFormValid();
        return(
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar usuario</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="col">
                                    <label htmlFor="username-input">Nombre de usuario</label>
                                    <input type="text" id="username-input" name="username" value={this.state.username} className="form-control" onChange={this.handleChange} onKeyPress={this.handleKeyPress}/>
                                </div>
                                <div className="col">
                                    <label htmlFor="password-input">{this.props.action == 'add' ? 'Contraseña' : 'Nueva contraseña'}</label>
                                    <input type="password"
                                        id="password-input"
                                        name="password"
                                        value={this.state.password ? this.state.password : ''}
                                        className="form-control" onChange={this.handleChange}
                                        onKeyPress={this.handleKeyPress}
                                        placeholder={this.props.action == 'edit' ? 'Dejar en blanco para no modificar' : ''}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col">
                                    <label htmlFor="firstname-input">Nombre</label>
                                    <input type="text" id="firstname-input" name="firstname" value={this.state.firstname} className="form-control"onChange={this.handleChange} onKeyPress={this.handleKeyPress}/>
                                </div>
                                <div className="col">
                                    <label htmlFor="lastname-input">Apellido</label>
                                    <input type="text" id="lastname-input" name="lastname" value={this.state.lastname} className="form-control" onChange={this.handleChange} onKeyPress={this.handleKeyPress}/>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col">
                                    <label htmlFor="username-email">Mail</label>
                                    <input type="text" id="username-email" name="email" value={this.state.email} className="form-control" onChange={this.handleChange} onKeyPress={this.handleKeyPress} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col">
                                    <h5>Roles</h5>
                                    {rolesList}
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" disabled={!isValid} onClick={this.saveUser}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddUserModal;