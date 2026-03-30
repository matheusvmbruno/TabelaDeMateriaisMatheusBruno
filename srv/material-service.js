const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Material } = this.entities;

    // FUNÇÃO: retorna N materiais da tabela
    this.on('filtroMateriais', async (req) => {
        const { quantidade } = req.data;

        if (!quantidade || quantidade <= 0) {
            req.error(400, 'Quantidade inválida.');
            return;
        }

        const materiais = await SELECT.from(Material).limit(quantidade);
        return materiais;
    });

    // ACTION: adiciona um novo material
    this.on('adicionarMaterial', async (req) => {
        const { ID, NumMat, Nome, Descr } = req.data;

        // Validar campos obrigatórios
        if (!NumMat || !Nome || !Descr) {
            return req.error(400, 'Todos os campos são obrigatórios.');
        }

        // Verificar se NumMat já existe
        const existente = await SELECT.one.from(Material).where({ NumMat });
        if (existente) {
            return req.error(409, `Material com NumMat ${NumMat} já cadastrado.`);
        }

        // Calcular próximo ID sequencial
        const ultimo = await SELECT.one.from(Material).orderBy('ID desc');
        const novoID = ultimo ? ultimo.ID + 1 : 1;

        // Inserir novo material
        await INSERT.into(Material).entries({
            ID: novoID,
            NumMat,
            Nome,
            Descr
        });

        return `Material "${Nome}" cadastrado com sucesso! ID: ${novoID}`;
    });
});