import React from 'react';

// Librerias
import Autocomplete from 'react-autocomplete';

/**
 * Componente React que renderiza el autocomplete de pacientes
 */
class PatientsAutocomplete extends React.Component {
    /**
     * Constructor
     * @param {*} props.selectPatient Funcion que hace de callback cuando se selecciona un paciente
     */
    constructor(props) {
        super(props);

        this.state = {
            patientInput: '',
            patientsSuggestion: []
        };

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.getPatientsSuggestion = this.getPatientsSuggestion.bind(this);
        this.cleanPatient = this.cleanPatient.bind(this);
    }

    /**
     * Obtiene los phenotypos
     * @param {Event} e Evento de cambio del input
     */
    getPatientsSuggestion(e) {
        let self = this;
        self.setState({ patientInput: e.target.value }, () => {
            // Hago el request
            $.ajax({
                url: 'http://localhost:8080/patients/',
                data: {
                    search: self.state.patientInput
                }
            }).done(function (jsonResponse) {
                // Actualizo la lista de sugerencias
                self.setState({ patientsSuggestion: jsonResponse.content });
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log("Error al obtener los nombres", jqXHR, textStatus, errorThrown);
            });;
        });
    }

    /**
     * Llama al callback especificado
     * @param {*} patient Paciente seleccionada
     */
    selectPatient(patient) {
        // Guardo el nombre seleccionado, limpio las sugerencias y despues llamo al callback 
        // pasado por props
        this.setState({
            patientInput: this.props.preserveInput ? patient.name : '',
            patientsSuggestion: []
        }, () => {
            this.props.selectPatient(patient);
        });
    }

    /**
     * Limpia el input y las sugerencas
     */
    cleanPatient() {
        this.setState({
            patientInput: '',
            patientsSuggestion: []
        }, () => {
            this.props.cleanPatient();
        });
    }

    render() {
        return (
            <div className="form-row">
                <div className="col-md-6 div-autocomplete margin-bottom">
                    <h5>Nombre del paciente</h5>
                    <Autocomplete
                        getItemValue={(patient) => patient.name}
                        items={this.state.patientsSuggestion}
                        renderItem={(patient, isSelect) =>
                            <div key={patient.id.toString()} className={'autocomplete-option ' + (isSelect ? 'selected' : '')}>
                                {patient.name}
                            </div>
                        }
                        inputProps={{
                            disabled: this.props.disabled
                        }}
                        value={this.state.patientInput}
                        onChange={this.getPatientsSuggestion}
                        onSelect={(value, patient) => { this.selectPatient(patient) }}
                    />
                </div>
                <div className="col-md-6">
                    <h5>Limpiar paciente</h5>
                    <button className="btn btn-danger" onClick={this.cleanPatient} disabled={!this.state.patientInput || this.props.buttonDisabled}>Limpiar</button>
                </div>
            </div>
        );
    }
}

export default PatientsAutocomplete;