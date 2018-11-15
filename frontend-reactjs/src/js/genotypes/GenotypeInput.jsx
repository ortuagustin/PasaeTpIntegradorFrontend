import React from 'react';

/**
 * Renderiza el textarea para ingresar los SNPS
 * @param {*} props Props del componente
 */
export default function GenotypeInput(props) {
    return (
        <div className="form-row">
            <div className="col-md-12">
                <label htmlFor="patient-genotype-input">{props.labelDescription}</label>
                {props.genotypeError &&
                    <p id="genotype-error-message">{props.genotypeError}</p>}
                <textarea id="patient-genotype-input"
                    type="text"
                    name="genotype"
                    value={props.genotype}
                    className="form-control"
                    onChange={props.handleChange}
                    disabled={props.disabled}
                />
            </div>
        </div>
    );
}