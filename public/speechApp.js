// status fields and start button in UI
var translateBox0;
var startRecognizeOnceAsyncButton;

// subscription key and region for speech services.
var subscriptionKey = "ada7b6e8bad148a19cc80113c39046c5", serviceRegion = "eastus", languageTargetOptions, languageSourceOptions;
var SpeechSDK;
var recognizer;

document.addEventListener("DOMContentLoaded", function () {
  startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
  languageTargetOptions = document.getElementById("languageTargetOptions");
  languageSourceOptions = document.getElementById("languageSourceOptions");
  translateBox0 = document.getElementById("translateBox0");

  startRecognizeOnceAsyncButton.addEventListener("click", function () {
    startRecognizeOnceAsyncButton.disabled = true;
    translateBox0.innerHTML = "";

    // if we got an authorization token, use the token. Otherwise use the provided subscription key
    var speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(subscriptionKey, serviceRegion);
    
    speechConfig.speechRecognitionLanguage = languageSourceOptions.value;
    let language = languageTargetOptions.value
    speechConfig.addTargetLanguage(language)

    //var audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    recognizer = new SpeechSDK.TranslationRecognizer(speechConfig);
    recognizer.recognizing = (s, e) => {
        console.log("Recognizing speech . . .");
    };

    recognizer.recognized = (s, e) => {
        let translation = e.result.translations.get(language);
        console.log(`RECOGNIZED: Text=${translation}`);
        translateBox0.innerHTML = translation;
        socket.emit('translation', translation);
    };

    recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);

        if (e.reason == CancellationReason.Error) {
            console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
            console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
            console.log("CANCELED: Did you update the subscription info?");
        }

        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStopped = (s, e) => {
        console.log("\n    Session stopped event.");
        recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();

  });
    // make the following call at some point to stop recognition.
    // recognizer.StopContinuousRecognitionAsync();




  if (!!window.SpeechSDK) {
    SpeechSDK = window.SpeechSDK;
    startRecognizeOnceAsyncButton.disabled = false;

    // in case we have a function for getting an authorization token, call it.
    if (typeof RequestAuthorizationToken === "function") {
      RequestAuthorizationToken();
    }
  }
});