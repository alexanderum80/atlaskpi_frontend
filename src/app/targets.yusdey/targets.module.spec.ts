import { TargetsModule } from './targets.module';

describe('TargetsModule', () => {
  let targetsModule: TargetsModule;

  beforeEach(() => {
    targetsModule = new TargetsModule();
  });

  it('should create an instance', () => {
    expect(targetsModule).toBeTruthy();
  });
});
