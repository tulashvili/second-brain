import { loadQuartzConfig } from "./quartz/plugins/loader/config-loader"
import { isPublishedArticle } from "./plugins/semantic-navigation/src/model"

const config = await loadQuartzConfig()
export default config

export { isPublishedArticle }
