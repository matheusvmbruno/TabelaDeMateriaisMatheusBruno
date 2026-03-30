using materiais as db from '../db/schema';

service MaterialService {
    entity Material as projection on db.Material;

    function filtroMateriais(quantidade : Integer) returns array of Material;

    action adicionarMaterial(ID : Integer, NumMat : Integer, Nome : String, Descr : String) returns String;
}