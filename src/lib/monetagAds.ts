/**
 * Ad Network Manager (Monetag Disabled - Google AdSense Primary)
 */

export interface MonetagConfig {
  enabled: boolean;
  multiTagZoneId: string;
  multiTagScriptUrl: string;
  pushZoneId: string;
  pushDomain: string;
  directLinkUrl: string;
  enableInPagePush: boolean;
  enableVignette: boolean;
  enablePopunder: boolean;
  enableDirectLink: boolean;
  monetagVerification: string;
}

export const DEFAULT_MONETAG_CONFIG: MonetagConfig = {
  enabled: false,
  multiTagZoneId: '',
  multiTagScriptUrl: '',
  pushZoneId: '',
  pushDomain: '',
  directLinkUrl: '',
  enableInPagePush: false,
  enableVignette: false,
  enablePopunder: false,
  enableDirectLink: false,
  monetagVerification: ''
};

class MonetagAdManager {
  private config: MonetagConfig = { ...DEFAULT_MONETAG_CONFIG };

  public getConfig(): MonetagConfig {
    return this.config;
  }

  public injectMonetagScripts() {
    // Disabled
  }

  public triggerVignetteTransition() {
    // Disabled
  }

  public openDirectLink() {
    // Disabled
  }
}

export const monetagManager = new MonetagAdManager();
