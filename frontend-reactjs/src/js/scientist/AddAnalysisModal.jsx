import React from 'react';

// Componentes
import PathologyAutocomplete from '../pathologies/PathologyAutocomplete.jsx';
import PatientsAutocomplete from '../patients/PatientsAutocomplete.jsx';
import GenotypeInput from '../genotypes/GenotypeInput.jsx';
import GenotypeTable from '../genotypes/GenotypeTable.jsx';

// Iconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

// Funciones
import { actionModal } from '../functions_util';

/**
 * Renderiza el modal con los campos de alta de una analisis
 * @param {string} modalId Id del modal
 * @param {string} action Para saber si se esta agregando o eliminando una analisis
 * @param {Function} getAnalysis Funcion para refrescar la tabla
 */
export default class AddAnalysisModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = this.getDefaultState();

        // Bindeo la variable 'this' a los metodos llamados desde la vista
        this.checkSnpsAnalysis = this.checkSnpsAnalysis.bind(this);
        this.selectPathology = this.selectPathology.bind(this);
        this.selectPatient = this.selectPatient.bind(this);
        this.cleanPathology = this.cleanPathology.bind(this);
        this.cleanPatients = this.cleanPatients.bind(this);
        this.selectPhenotype = this.selectPhenotype.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.selectSnp = this.selectSnp.bind(this);
        this.clickAction = this.clickAction.bind(this);
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
     * Evalua si ya se obtuvieron o no los estadisticos y el p-valor
     * de los SNPS seleccionados para saber si evalua o guarda
     */
    clickAction() {
        if (this.state.genotypeIsChecked) {
            this.saveAnalysis();
        } else {
            this.checkSnpsAnalysis();
        }
    }

    /**
     * Selecciona el fenotipo a evaluar
     * @param {*} phenotype Fenotipo a seleccionar
     * @param {*} phenotypeType Tipo del fenotipo a seleccionar
     */
    selectPhenotype(phenotype, phenotypeType) {
        this.setState({
            selectedPhenotype: phenotype,
            selectedPhenotypeKind: phenotypeType
        });
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
                numericPhenotypesValues: [], // Arreglo de valores de fenotipos numericos elegidos
                categoricPhenotypesValues: [], // Arreglo de valores de fenotipos categoricos elegidos
            },
            selectedPathology: this.getSelectedPathologyDefault(),
            selectedPhenotype: {},
            genotypeIsChecked: false,
            snpsData: [],
            selectedPhenotypeKind: null,
            analysisDescription: '',
            cutoffValue: '',
            genotype: '',
            selectedPatients: [],
            adding: false,
            genotypeError: null
        }
    }

    /**
     * Limpia todos los inputs del formulario
     */
    cleanInputs() {
        // this.setState(this.getDefaultState());
    }

    /**
     * Selecciona una patologia, y hace un request para obtener sus
     * fenotipos asociados
     * @param {*} pathology Patologia seleccionada
     */
    selectPathology(pathology) {
        let self = this;
        $.ajax({
            url: 'http://localhost:8080/pathologies/' + pathology.id,
            dataType: "json",
        }).done(function (jsonReponse) {
            if (jsonReponse) {
                // Selecciono la patologia, limpio el input y las sugerencias
                self.setState({ selectedPathology: jsonReponse });
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Error al obtener los datos de la patologia. Intente nuevamente más tarde");
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
     * Selecciona/deselecciona un SNP
     * @param {number} snpId Id del SNP que esta siendo seleccionado
     * @param {boolean} isChecked True si esta seleccionado, false caso contrario
     */
    selectSnp(snpId, isChecked) {
        let snpsData = this.state.snpsData;
        let idx = snpsData.findIndex((snp) => snp.snp == snpId);
        snpsData[idx].isSelected = isChecked;
        this.setState({ snpsData });
    } 

    /**
     * Ni bien se renderiza el componente pedimos los roles
     * al servidor
     */
    componentDidMount() {
        let self = this;
        
        // Cuando se termina de abrir hago focus en el input de descripcion
        $('#' + self.props.modalId).on('shown.bs.modal', function () {
            $('#analysisDescription-input').focus();
        });

        // Cuando se esconde limpio los inputs
        $('#' + self.props.modalId).on('hidden.bs.modal', function () {
            self.cleanInputs();
        });
    }

    /**
     * Limpia los pacientes seleccionados
     */
    cleanPatients() {
        this.setState({ selectedPatients: [] });
    }

    /**
     * Genera un diccionario para cada snp con su info
     * @param {*[]} snpsData Arreglo con la informacion para cada SNP
     * @returns {*[]} Diccionario con los datos para la tabla de los genotipos
     */
    generateSnpData(snpsData) {
        let parsedData = [];
        snpsData.forEach((snpsData) => {
            parsedData.push({
                snp: snpsData.snp,
                statistical: snpsData.statistical,
                pvalue: snpsData.pvalue,
                isSelected: false
            })
        });

        return parsedData;
    }

    /**
     * Hace un request al server para agregar una analisis
     */
    checkSnpsAnalysis() {
        let self = this;
        // Si el formulario es invalido no hago nada
        if (!self.isFormValid()) {
            return;
        }

        $.ajax({
            url: 'http://localhost:8080/analysis/',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'PUT',
            data: JSON.stringify({
                description: self.state.analysisDescription,
                patientsIds: self.state.selectedPatients.map((patient) => patient.id),
                phenotypeId: self.state.selectedPhenotype.id,
                phenotypeKind: self.state.selectedPhenotypeKind,
                cutoffValue: self.state.cutoffValue,
                snps: self.state.genotype
            })
        }).done(function (responseJSON) {
            self.setState({
                genotypeIsChecked: true,
                snpsData: self.generateSnpData(responseJSON.snps)
            });
        }).fail(function (jqXHR, textStatus, errorThrown) {
            let genotypeErrorMessage = null;
            if (jqXHR.status == 400) {
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
                alert("Error al dar de alta al análisis. Intente nuevamente más tarde");
            }
            self.setState({ genotypeError: genotypeErrorMessage });
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
     * Hace un request al server para agregar una analisis
     */
    saveAnalysis() {
        let self = this;
        // Si el formulario es invalido no hago nada
        if (!self.isFormValid()) {
            return;
        }

        $.ajax({
            url: 'http://localhost:8080/analysis/draft',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: 'PATCH',
            data: JSON.stringify({
                description: self.state.analysisDescription,
                patientsIds: self.state.selectedPatients.map((patient) => patient.id),
                phenotypeId: self.state.selectedPhenotype.id,
                phenotypeKind: self.state.selectedPhenotypeKind,
                cutoffValue: self.state.cutoffValue,
                snps: self.state.snpsData.filter((snp) => snp.isSelected) // Solo me quedo con los seleccionados
            })
        }).done(function () {
            // En caso de exito...
            self.props.getAnalysis(); // Refresco la tabla
            actionModal(self.props.modalId, 'hide'); // Escondo el modal
        }).fail(function (jqXHR, textStatus, errorThrown) {
            let genotypeErrorMessage = null;
            if (jqXHR.status == 400) {
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
                alert("Error al dar de alta al análisis. Intente nuevamente más tarde");
            }
            self.setState({ genotypeError: genotypeErrorMessage });
            console.log(jqXHR, textStatus, errorThrown);
        });
    }

    /**
     * Limpia el buscador y la patologia seleccionada
     */
    cleanPathology() {
        this.setState({
            selectedPathology: this.getSelectedPathologyDefault(),
            selectedPhenotype: {},
            selectedPhenotypeKind: null
        });
    }

    /**
     * Valida el formulario
     * @returns True si el formulario es valido, false caso contrario
     */
    isFormValid() {
        return !this.state.adding
            && this.state.selectedPhenotype.id
            && (
                this.state.selectedPhenotypeKind == 'categoric'
                || (
                    this.state.selectedPhenotypeKind == 'numeric'
                    && this.state.cutoffValue
                )
            )
            && this.state.selectedPatients.length
            && this.state.genotype;
    }

    /**
     * Agrega un paciente a la lista de pacientes seleccionados
     * @param {*} patient Paciente a seleccionar
     */
    selectPatient(patient) {
        // Primero verifico que no esté previamente seleccionado el paciente
        if (this.state.selectedPatients.some((selectedPatient) => selectedPatient.id == patient.id)) {
            alert('El paciente ya fue seleccionado');
            return;
        }

        let selectedPatients = this.state.selectedPatients;
        selectedPatients.push(patient);
        this.setState({ selectedPatients });
    }

    /**
     * Elimina un paciente en particular
     * @param {number} idx Indice del paciente a eliminar
     */
    removePatient(idx) {
        let selectedPatients = this.state.selectedPatients;
        selectedPatients.splice(idx, 1);
        this.setState({ selectedPatients });
    }

    /**
     * Genera un arreglo de SNPS a partir del genotipo
     * @returns {string[]} Arreglo de SNPS
     */
    getSnpsFromGenotype() {
        return this.state.genotype.split('\n').map((line) => line.trim());
    }

    render() {
        // Verifico que no este cargando y que el formulario sea valido
        const isValid = this.isFormValid();

        // Genero el autocomplete o grilla de los SNPS
        let genotypeInput;
        if (!this.state.genotypeIsChecked) {
            genotypeInput = (
                <GenotypeInput
                    labelDescription="SNPS"
                    genotypeError={this.state.genotypeError}
                    genotype={this.state.genotype}
                    handleChange={this.handleChange}
                    disabled={this.state.genotypeIsChecked}
                />
            );
        } else {
            // Si ya tengo los estadisticos y el p-valor para los SNPS,
            // genero la tabla para la seleccion
            genotypeInput = (
                <GenotypeTable
                    snpsData={this.state.snpsData}
                    selectSnp={this.selectSnp}
                />
            );
        }

        // Genero un listado de fenotipos disponibles para seleccionar
        const numericPhenotypesOptions = this.state.selectedPathology.numericPhenotypes.map((numericPhenotype) => {
            return (
                <div key={numericPhenotype.id.toString()}
                    className={"col phenotype-option cursor-pointer " + (this.state.selectedPhenotype.id == numericPhenotype.id ? 'selected' : '')}
                    onClick={() => this.selectPhenotype(numericPhenotype, 'numeric')}>
                    {numericPhenotype.name}
                </div>
            );
        });

        const categoricPhenotypesOptions = this.state.selectedPathology.categoricPhenotypes.map((categoricPhenotype) => {
            return (
                <div key={categoricPhenotype.id.toString()}
                    className={"col phenotype-option cursor-pointer " + (this.state.selectedPhenotype.id == categoricPhenotype.id ? 'selected' : '')}
                    onClick={() => this.selectPhenotype(categoricPhenotype, 'categoric')}>
                    {categoricPhenotype.name}
                </div>
            );
        });

        // Armo la lista de pacientes seleccionados
        const selectedPatientsList = this.state.selectedPatients.map((patient, idx) => {
            return (
                <div key={patient.id.toString()}
                    className="col patient-selected">
                    {patient.name}
                    {!this.state.genotypeIsChecked &&
                        <span className="remove-patient-button cursor-pointer"
                            onClick={() => this.removePatient(idx)}>
                            <FontAwesomeIcon icon={faTimesCircle} />
                        </span>
                    }
                </div>
            );
        });

        // Panel de seleccion de corte (solo para los fenotipos numericos)
        const cutoffValuePanel = (this.state.selectedPhenotypeKind == 'numeric') ? (
            <div className="row margin-top">
                <div className="col">
                    <div className="form-group">
                        <label htmlFor="cutoffValue-input">Valor de corte</label>
                        <input id="cutoffValue-input"
                            type="text"
                            className="form-control"
                            name="cutoffValue"
                            onChange={this.handleChange}
                            value={this.state.cutoffValue}
                            pattern="[0-9]*"
                            placeholder="Ingrese un numero"/>
                    </div>
                </div>
            </div>
        ) : null;

        return (
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby={this.props.modalId} aria-hidden="true">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Agregar análisis</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">

                            {/* Input con la descripcion del analisis */}
                            <div className="row margin-top">
                                <div className="col">
                                    <div className="form-group">
                                        <label htmlFor="analysisDescription-input">Descripción</label>
                                        <input id="analysisDescription-input"
                                            type="text"
                                            className="form-control"
                                            name="analysisDescription"
                                            onChange={this.handleChange}
                                            disabled={this.state.genotypeIsChecked}
                                            value={this.state.analysisDescription}/>
                                    </div>
                                </div>
                            </div>

                            {/* Autocomplete de las patologias */}
                            <PathologyAutocomplete
                                selectPathology={this.selectPathology}
                                cleanPathology={this.cleanPathology}
                                disabled={this.state.genotypeIsChecked}
                                buttonDisabled={this.state.genotypeIsChecked}
                            />

                            {/* Lista de fenotipos disponibles */}
                            <div className="container">
                                <div className="row">
                                    {numericPhenotypesOptions}

                                    {categoricPhenotypesOptions}
                                </div>
                            </div>

                            {/* Panel de seleccion de punto de corte (para los
                            fenotipos numericoa) */}
                            {cutoffValuePanel}

                            {/* Autocomplete de pacientres */}
                            <PatientsAutocomplete
                                selectPatient={this.selectPatient}
                                cleanPatient={this.cleanPatients}
                                disabled={this.state.genotypeIsChecked}
                                buttonDisabled={this.state.genotypeIsChecked}
                            />

                            {/* Lista de pacientes seleccionados */}
                            <div className="container">
                                <div className="row">
                                    {selectedPatientsList}
                                </div>
                            </div>

                            {/* Text area o grilla con los genotipos
                            dependiendo del estado en que se encuentre el analisis */}
                            { genotypeInput }

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Cerrar</button>
                            <button type="button" className="btn btn-primary" disabled={!isValid} onClick={this.clickAction}>
                                {this.state.genotypeIsChecked ? 'Guardar' : 'Chequear'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}