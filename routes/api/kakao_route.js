const kakaoController = require('../../controllers/api/kakao_controller');

const router = require('express').Router();


router.post('/messageReply',kakaoController.messageReply);

router.get('/getImageFromWebsite',kakaoController.getImageFromWebsite);

module.exports = router;