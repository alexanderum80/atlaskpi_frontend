export class IdNameKeyPair {
    id: number;
    name: string;

   constructor(model: any) {
       Object.assign(this, model.id, model.name);
   }
}
