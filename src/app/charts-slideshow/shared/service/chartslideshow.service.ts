
export class ChartSlideshowService {

    existDuplicatedName: boolean;

    updateExistDuplicatedName(duplicateName: boolean) {
        this.existDuplicatedName = duplicateName;
    }

    getExistDuplicatedName() {
        return this.existDuplicatedName;
    }

}
