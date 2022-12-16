import { styled, Button } from '@material-ui/core'

// テーマカラー的に自動でテキストが黒になってしまうのを上書き
const WhiteButton = styled(Button)({
  color: 'white;!important',
})
export default WhiteButton
