import React from 'react';

/**
 * Renderiza la tabla de SNPS definidos, junto con sus valores
 * estadistico y p-valor para poder seleccionarlos y dar de alta
 * un analisis
 * @param {*} props Props del componente
 */
export default function GenotypeTable(props) {
    const listOfSnp = props.snpsData.map((snp) => {
        return (
            <tr key={snp.snp}>
                <td>{snp.snp}</td>
                <td>{snp.statistical}</td>
                <td>{snp.pvalue}</td>
                <td>
                    <input type="checkbox"
                        value={snp.isSelected}
                        onChange={(e) => props.selectSnp(snp.snp, e.target.checked)}/>
                </td>
            </tr>
        );
    });

    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th scope="col">SNP</th>
                    <th scope="col">Estadístico</th>
                    <th scope="col">P-valor</th>
                    <th scope="col">Seleccionado</th>
                </tr>
            </thead>
            <tbody>
                { listOfSnp }
            </tbody>
        </table>
    );
}