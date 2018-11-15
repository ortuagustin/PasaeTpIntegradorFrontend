import React from 'react';

// Componentes
import PathologyAutocomplete from '../pathologies/PathologyAutocomplete.jsx';
import GenotypeInput from '../genotypes/GenotypeInput.jsx';

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modal con los campos de alta de un paciente
 * @param {string} modalId Id del modal
 * @param {string} action Para saber si se esta agregando o eliminando un paciente
 * @param {*} selectedPatient Si action == 'edit' se utiliza para cargar los datos del paciente a editar
 * @param {Function} getPatients Funcion para refrescar la tabla
 */
class AddPatientModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getDefaultState();

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.savePatient = this.savePatient.bind(this);
        this.cleanPathology = this.cleanPathology.bind(this);
        this.selectPathology = this.selectPathology.bind(this);
        this.handlePatientChanges = this.handlePatientChanges.bind(this);
    }

    /**
     * Genera una patologia por defecto
     * @returns {*} Patologia por defecto
     */
    getSelectedPathologyDefault() {
        return {
            numericPhenotypes: [],
            categoricPhenotypes: []
        };
    }

    /**
     * Genera el state por defecto
     * @returns {*} State default
     */
    getDefaultState() {
        return {
            patient: {
                name: '',
                surname: '',
                dni: '',
                email: '',
                genotype: '',
                numericPhenotypes: [], // Arreglo de valores de fenotipos numericos elegidos
                categoricPhenotypes: [], // Arreglo de valores de fenotipos categoricos elegidos
            },
            selectedPathology: this.getSelectedPathologyDefault(),
            phenotypeType: 'numeric', // Tipo de paciente a buscar
            adding: false,
            genotypeError: null
        }
    }

    /**
     * Metodo que se ejecuta cuando los inputs referentes al paciente cambian.
     * Sirve para refrescar el state
     * @param {Event} e Evento del cambio del input
     */
    handlePatientChanges(e) {
        // Verifico que el formulario sea valido
        if (!e.target.validity.valid) {
            return;
        }
        let patient = this.state.patient;
        patient[e.target.name] = e.target.value;
        // Modifico
        this.setState({ patient });
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
     * Limpia todos los inputs del formulario
     */
    cleanInputs() {
        this.setState(this.getDefaultState());
    }

    /**
     * Cambia el valor de un fenotipo elegido
     * @param {Event} e Evento de cambio
     * @param {number} idx Indice del arreglo donde se encuentra el valor a editar
     * @param {string} type 'numeric' o 'categoric' para saber que estamos editando
     */
    changePhenotypeValue(e, idx, type) {
        if (type == 'numeric') {
            // Si no es valido, retorno
            if (!e.target.validity.valid) {
                return;
            }

            let numericPhenotypes = this.state.patient.numericPhenotypes;
            numericPhenotypes[idx].value = e.target.value;
            this.setState({ numericPhenotypes });
        } else {
            let categoricPhenotypes = this.state.patient.categoricPhenotypes;
            categoricPhenotypes[idx].valueId = e.target.value;
            this.setState({ categoricPhenotypes });
        }

    }

    /**
     * Selecciona una patologia, y hace un request para obtener sus
     * fenotipos asociados
     * @param {*} pathology Patologia seleccionada
     */
    selectPathology(pathology) {
        let self = this;
        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/pathologies/' + pathology.id,
            dataType: "json",
        }).done(function (jsonReponse) {
            if (jsonReponse) {
                let patient = self.state.patient;

                // Los siguientes dos maps se hacen para que sea compatible el alta con la edicion
                patient.numericPhenotypes = jsonReponse.numericPhenotypes.map((phenotype) => {
                    return { phenotype: phenotype }
                });

                patient.categoricPhenotypes = jsonReponse.categoricPhenotypes.map((phenotype) => {
                    return { phenotype: phenotype }
                });

                // Selecciono la patologia, limpio el input y las sugerencias
                self.setState({
                    selectedPathology: jsonReponse,
                    patient
                });
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al obtener los datos de la patologia. Intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
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
            if (self.props.action == 'edit') {
                // Si estamos editando, cargo los datos del paciente
                // seleccionado en el formulario
                self.updateForm();
            }
        });

        // Cuando ya esta abierto el modal, hago focus en el
        // primer input
        $('#' + self.props.modalId).on('shown.bs.modal', function() {
            $('#patient-name-input').focus();
        });

        // Cuando se esconde limpio los inputs
        $('#' + self.props.modalId).on('hidden.bs.modal', function() {
            self.cleanInputs();
        });
    }

    /**
     * Completa el formulario con los datos del paciente que
     * estamos editando
     */
    updateForm() {
        // Actualizo los datos
        let patient = this.state.patient;

        patient.id = this.props.selectedPatient.id;
        patient.dni = this.props.selectedPatient.dni;
        patient.email = this.props.selectedPatient.email;
        patient.name = this.props.selectedPatient.name;
        patient.surname = this.props.selectedPatient.surname;
        patient.genotype = this.props.selectedPatient.genotype.map((snp) => {
            return 'rs' + snp.snp + ' ' + snp.value;
        }).join('\n');
        patient.numericPhenotypes = this.props.selectedPatient.numericPhenotypes;
        patient.categoricPhenotypes = this.props.selectedPatient.categoricPhenotypes;

        this.setState({ patient });
    }

    /**
     * Maneja el evento cuando se presiona una tecla en el
     * formualario
     * @param {Event} e Evento de la presion de la tecla
     */
    handleKeyPress(e) {
        // Si presiona enter hacemos el submit
        if (e.which == 13) {
            this.savePatient();
        }
    }

    /**
     * Hace un request al server para agregar un paciente
     */
    savePatient() {
        let self = this;
        // Si el formulario es invalido no hago nada
        if (!self.isFormValid()) {
            return;
        }

        let patientId = self.props.action == 'edit' ? self.props.selectedPatient.id : '';

        $.ajax({
            url: 'https://pasae-backend.herokuapp.com/patients/' + patientId,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: self.props.action == 'add' ? 'PUT' : 'PATCH',
            data: JSON.stringify({
                userId: self.props.currentUserId,
                name: self.state.patient.name,
                surname: self.state.patient.surname,
                dni: self.state.patient.dni,
                email: self.state.patient.email,
                numericPhenotypes: self.state.patient.numericPhenotypes.map(phenotypeObj => {
                    return {
                        id: phenotypeObj.phenotype.id,
                        value: phenotypeObj.value
                    };
                }),
                categoricPhenotypes: self.state.patient.categoricPhenotypes.map(phenotypeObj => {
                    return {
                        id: phenotypeObj.phenotype.id,
                        valueId: phenotypeObj.valueId
                    };
                }),
                genotype: self.state.patient.genotype
            })
        }).done(function () {
            // En caso de exito...
            self.props.getPatients(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            let genotypeErrorMessage = null;
            if (jqXHR.status == 400) {
                // Parseo los errores
                let errors = jqXHR.responseJSON.errors;

                // Veo si es un error personalizado para genotipos...
                if (jqXHR.responseJSON.genotype_error) {
                    genotypeErrorMessage = 'Error en la/s linea/s: ' + errors.map((obj) => obj.index + 1).join(', ');
                } else {
                    // ... O si es un error de validacion generado por Spring
                    if (errors) {
                        alert('Los campos ' + errors.map((error) => error.field).join(', ') + ' son inválidos');
                    } else {
                        alert("Error al dar de alta al paciente. Intente nuevamente más tarde");
                    }
                }
            } else {
                alert("Error al dar de alta al paciente. Intente nuevamente más tarde");
            }
            self.setState({ genotypeError: genotypeErrorMessage });
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
     * Edita un valor
     * @param {Event} e Evento de cambio
     * @param {number} idx Index del valor a editar
     */
    changeValue(e, idx) {
        // Verifico que el formulario sea valido
        if (!e.target.validity.valid) {
            return;
        }

        let phenotypes = this.state.phenotypes;
        phenotypes[idx] = e.target.value;
        this.setState({ phenotypes });
    }

    /**
     * Limpia el buscador y la patologia seleccionada
     */
    cleanPathology() {
        this.setState({ selectedPathology: this.getSelectedPathologyDefault() });
    }

    /**
     * Valida el formulario
     * @returns True si el formulario es valido, false caso contrario
     */
    isFormValid() {
        return !this.state.adding
            && this.state.patient.name
            && this.state.patient.surname
            && this.state.patient.dni
            && this.state.patient.email
            && this.state.patient.genotype
            && (
                (
                    // Si estoy agregando...
                    this.props.action == 'add'
                    // Verifico que haya una patologia seleccionada y validad
                    && (
                        this.state.selectedPathology.numericPhenotypes.length
                        || this.state.selectedPathology.categoricPhenotypes.length
                    )
                    // Ok, tenemos patologia
                    && (
                        // Me fijo, si esa patologia, tiene fenotipos numericos
                        // entonces que esten completos
                        !this.state.selectedPathology.numericPhenotypes.length
                        || (
                            this.state.selectedPathology.numericPhenotypes.length
                            && !this.state.patient.numericPhenotypes.some((phenotype) => phenotype.value.toString().trim().length == 0) // No tiene que haber ningun fenotipo sin valores asignados
                        )
                    ) && (
                        // Me fijo, si esa patologia, tiene fenotipos categoricos
                        // entonces que esten completos
                        !this.state.selectedPathology.categoricPhenotypes.length
                        || (
                            this.state.selectedPathology.categoricPhenotypes.length
                            && !this.state.patient.categoricPhenotypes.some((phenotype) => !phenotype.valueId) // No tiene que haber ningun fenotipo sin valores asignados
                        )
                    )
                ) || (
                    // Si estoy editando...
                    (
                        !this.state.patient.numericPhenotypes.length
                        || (
                            this.state.patient.numericPhenotypes.length
                            && !this.state.patient.numericPhenotypes.some((phenotype) => !phenotype.value)
                        )
                    ) && (
                        !this.state.patient.categoricPhenotypes.length
                        || (
                            this.state.patient.categoricPhenotypes.length
                            && !this.state.patient.categoricPhenotypes.some((phenotype) => !phenotype.valueId)
                        )
                    )
                )
            )
    }

    render() {
        // Lista con los fenotipos seleccionados
        let valuesComponent = null;
        let numericValues = this.props.action == 'edit' ? this.state.patient.numericPhenotypes : this.state.selectedPathology.numericPhenotypes;

        let numericPhenotypesvaluesList = numericValues.map((phenotypeObj, idx) => {
            return (
                <div key={"input-value-numeric-div-" + phenotypeObj.phenotype.id} className="row margin-bottom text-center">
                    <div className="col-md-6">
                        <h5>{phenotypeObj.phenotype.name}</h5>
                    </div>
                    <div className="col-md-6">
                        <input type="text"
                            className="form-control"
                            pattern="[0-9]*"
                            value={this.state.patient.numericPhenotypes[idx].value}
                            onChange={(e) => this.changePhenotypeValue(e, idx, 'numeric')}/>
                    </div>
                </div>
            );
        });

        let phenotypesValues = this.props.action == 'edit' ? this.state.patient.categoricPhenotypes : this.state.selectedPathology.categoricPhenotypes;
        let categoricPhenotypesvaluesList = phenotypesValues.map((phenotypeObj, idx) => {
            let phenotypeInfo = this.props.action == 'edit' ? phenotypeObj.phenotype : phenotypeObj;
            let options = phenotypeInfo.values.map((phenotypeValue) => {
                return <option key={phenotypeValue.id.toString()} value={phenotypeValue.id}>{phenotypeValue.value}</option>;
            });

            let valueId = this.state.patient.categoricPhenotypes[idx].valueId ? this.state.patient.categoricPhenotypes[idx].valueId : '';

            return (
                <div key={"input-value-categoric-div-" + phenotypeInfo.id} className="row margin-bottom text-center">
                    <div className="col-md-6">
                        <h5>{phenotypeInfo.name}</h5>
                    </div>
                    <div className="col-md-6">
                        <select name={"value-" + phenotypeInfo.id}
                            className="form-control"
                            value={valueId}
                            onChange={(e) => this.changePhenotypeValue(e, idx, 'categoric')}>
                            <option value="" defaultChecked>Seleccionar</option>

                            {options}
                        </select>
                    </div>
                </div>
            );
        });

        valuesComponent = (
            <div className="form-row">
                <div className="col-md-12">
                    <h5>Fenotipos</h5>

                    <p>Numéricos</p>
                    {numericPhenotypesvaluesList}

                    <p>Categóricos</p>
                    {categoricPhenotypesvaluesList}
                </div>
            </div>
        );

        // Verifico que no este cargando y que el formulario sea valido
        let isValid = this.isFormValid();

        return (
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar paciente</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="col-md-6">
                                    <label htmlFor="patient-name-input">Nombre</label>
                                    <input type="text" id="patient-name-input" name="name" value={this.state.patient.name} className="form-control" onChange={this.handlePatientChanges} onKeyPress={this.handleKeyPress} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="patient-surname-input">Apellido</label>
                                    <input type="text" id="patient-surname-input" name="surname" value={this.state.patient.surname} className="form-control" onChange={this.handlePatientChanges} onKeyPress={this.handleKeyPress} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-4">
                                    <label htmlFor="patient-dni-input">DNI</label>
                                    <input type="text" id="patient-dni-input" name="dni" value={this.state.patient.dni} pattern="[0-9]*" maxLength="8" className="form-control" onChange={this.handlePatientChanges} onKeyPress={this.handleKeyPress} />
                                </div>
                                <div className="col-md-8">
                                    <label htmlFor="patient-email-input">Mail</label>
                                    <input type="text" id="patient-email-input" name="email" value={this.state.patient.email} className="form-control" onChange={this.handlePatientChanges} onKeyPress={this.handleKeyPress} />
                                </div>
                            </div>

                            {/* Input para ingresar el genotipo */}
                            <GenotypeInput
                                labelDescription="Genotipo"
                                genotypeError={this.state.genotypeError}
                                genotype={this.state.patient.genotype}
                                handleChange={this.handlePatientChanges}
                            />

                            {/* Autocomplete de las patologias */}
                            <PathologyAutocomplete
                                selectPathology={this.selectPathology}
                                cleanPathology={this.cleanPathology}
                                disabled={this.props.action == 'edit'}
                            />

                            {/* Listado con los valores para cada fenotipo de la patologia */}
                            <div className="row">
                                <div className="col-md-12">
                                    {valuesComponent}
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" disabled={!isValid} onClick={this.savePatient}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default AddPatientModal;