export const ORATORY_NAME = "Oratório";

export const ORATORY_DESCRIPTION =
  "Na Igreja Católica, a família é chamada de Igreja doméstica: o primeiro lugar onde se aprende a rezar, a amar e a viver a fé. Um oratório em casa consagra um espaço à presença de Deus, ao crucifixo, à Virgem Maria e à oração diária do casal, para que o matrimônio seja caminho de santidade.";

export const ORATORY_TEACHING =
  "Segundo o Magistério, o lar cristão é santuário onde Cristo habita; ali os esposos se santificam mutuamente e educam os filhos na fé. O oratório torna visível esse mistério: um lugar para a oração em comum, a leitura da Palavra e a consagração da vida conjugal a Deus.";

export function isOratoryItem(name: string, description?: string | null) {
  const haystack = `${name} ${description || ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return haystack.includes("oratorio");
}
