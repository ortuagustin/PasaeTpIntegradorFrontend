import React from 'react';

// Importo los estilos
import '../../css/login.css'; // Estilos principales del login

// Importo la imagen principal
import imgLogo from '../../img/adn.png';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            errorMessage: '',
            loading: false,
            error: false
        };

        // Bindeo la variable 'this' a los metodos
        this.login = this.login.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.isFormValid = this.isFormValid.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /**
     * Cuando se termina de renderizar, hago focus
     * en el input de username
     */
    componentDidMount() {
        $('#username').focus();
    }

    /**
     * Cambia el estado de las variables de estado
     * @param {*} e Evento del cambio de input
     */
    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    /**
     * Verifica si se presiona el enter para enviar el formulario
     * @param {*} e Evento de presion de una tecla
     */
    handleKeyPress(e) {
        // Si presiona enter hacemos el submit
        if (e.which == 13) {
            this.login();
        }
    }

    /**
     * Envia el formulario
     */
    login() {
        let self = this;
        self.setState({ loading: true}, () => {
            $.ajax({
                url: 'http://localhost:8080/login',
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify({
                    username: self.state.username,
                    password: self.state.password,
                })
            }).done(function (jsonResponse) {
                if (jsonResponse && jsonResponse.success) {
                    self.props.getCurrentUser();
                } else {
                    self.setState({ error: true });
                    if (jsonResponse.success == false) {
                        self.setState({ errorMessage: 'Usuario o contraseña inválida' });
                    }
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                alert("Ocurrió un error al iniciar sesion. Intente nuevamente más tarde");
                console.log("Error al iniciar sesion -> ", jqXHR, textStatus, errorThrown);
            }).always(function () {
                self.setState({ loading: false });
            });
        });
    }

    /**
     * Chequea la validez del formulario
     * @returns {boolean} True si es valido, false caso contrario
     */
    isFormValid() {
        return !this.state.loading
            && this.state.username.trim().length
            && this.state.password.trim().length;
    }

    render() {
        // Si hubo un error, lo muestro en pantalla
        let errorMessage = null;
        if (this.state.error) {
            errorMessage = (
                <div className="alert alert-danger alert-dismissible" role="alert">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    {this.state.errorMessage ? this.state.errorMessage : 'Error al iniciar sesión. Intente nuevamente'}
                </div>
            );
        }

        return (
            <div id="login-form">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <img id="login-icon" src={imgLogo} alt="Logo principal"/>
                    </div>
                </div>
                <div className="form">
                    {errorMessage}
                    <input type="text"
                        id="username"
                        name="username"
                        placeholder="Usuario"
                        value={this.state.username}
                        onChange={this.handleChange}
                        onKeyPress={this.handleKeyPress}
                    />
                    <input type="password"
                        id="password"
                        name="password"
                        placeholder="Contraseña"
                        value={this.state.password}
                        onChange={this.handleChange}
                        onKeyPress={this.handleKeyPress}
                    />
                    <button
                        id="boton-login"
                        className="btn"
                        onClick={this.login}
                        disabled={!this.isFormValid()}>Entrar</button>
                </div>
                <footer id="footer">
                    <div className="container text-center">
                        <span className="text-muted">PASAE 2018</span>
                    </div>
                </footer>
            </div>
        );
    }
}

export { Login };