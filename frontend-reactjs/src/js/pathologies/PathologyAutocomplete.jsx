import React from 'react';

// Librerias
import Autocomplete from 'react-autocomplete';

/**
 * Componente React que renderiza el autocomplete de una patologia
 */
class PathologyAutocomplete extends React.Component {
    /**
     * Constructor
     * @param {*} props.selectPathology Funcion que hace de callback cuando se selecciona una patologia
     */
    constructor(props) {
        super(props);

        this.state = {
            pathologyInput: '',
            pathologiesSuggestion: []
        };

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getPathologySuggestion = this.getPathologySuggestion.bind(this);
        this.cleanPathology = this.cleanPathology.bind(this);
    }

    /**
     * Obtiene los fenotipos
     * @param {Event} e Evento de cambio del input
     */
    getPathologySuggestion(e) {
        let self = this;
        self.setState({ pathologyInput: e.target.value }, () => {
            // Hago el request
            $.ajax({
                url: 'http://localhost:8080/pathologies/',
                data: {
                    search: self.state.pathologyInput
                }
            }).done(function (jsonResponse) {
                // Actualizo la lista de sugerencias
                self.setState({ pathologiesSuggestion: jsonResponse.content });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log("Error al obtener los nombres", jqXHR, textStatus, errorThrown);
            });;
        });
    }

    /**
     * Llama al callback especificado
     * @param {*} pathology Patologia seleccionada
     */
    selectPathology(pathology) {
        // Guardo el nombre seleccionado, limpio las sugerencias y despues llamo al callback 
        // pasado por props
        this.setState({
            pathologyInput: pathology.name,
            pathologiesSuggestion: []
        }, () => {
            this.props.selectPathology(pathology);
        });
    }

    /**
     * Limpia el input y las sugerencas
     */
    cleanPathology() {
        this.setState({
            pathologyInput: '',
            pathologiesSuggestion: []
        }, () => {
            this.props.cleanPathology();
        });
    }

    render() {
        return (
            <div className="form-row">
                <div className="col-md-6 div-autocomplete margin-bottom">
                    <h5>Nombre de la patología</h5>
                    <Autocomplete
                        getItemValue={(pathology) => pathology.name}
                        items={this.state.pathologiesSuggestion}
                        renderItem={(pathology, isSelect) =>
                            <div key={pathology.id.toString()} className={'autocomplete-option ' + (isSelect ? 'selected' : '')}>
                                {pathology.name}
                            </div>
                        }
                        value={this.state.pathologyInput}
                        onChange={this.getPathologySuggestion}
                        onSelect={(value, pathology) => { this.selectPathology(pathology) }}
                        inputProps={{
                            disabled: this.props.disabled
                        }}
                    />
                </div>
                <div className="col-md-6">
                    <h5>Limpiar patología</h5>
                    <button className="btn btn-danger" onClick={this.cleanPathology} disabled={!this.state.pathologyInput || this.props.buttonDisabled}>Limpiar</button>
                </div>
            </div>
        );
    }
}

export default PathologyAutocomplete;