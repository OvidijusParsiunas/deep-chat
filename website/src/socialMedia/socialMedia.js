import DeepChatBrowser from '../components/table/deepChatBrowser';
import huggingFaceLogo from '/img/huggingFaceLogo.png';
import stabilityAILogo from '/img/stabilityAILogo.png';
import assemblyAILogo from '/img/assemblyAILogo.png';
import openAILogo from '/img/openAILogo.png';
import cohereLogo from '/img/cohereLogo.png';
import azureLogo from '/img/azureLogo.png';
import React from 'react';

// used in the startPanel.js file
// may need to zoom out for a photo
// to prepare the social media preview:
//  remove the second element
// add the following property to customize - background: 'linear-gradient(19deg, rgba(255,255,255,1) 32%, rgba(247,250,255,1) 100%)',
// replace the customize-sub-header marginTop: '40px' with paddingTop: '40px'
const Logos = React.forwardRef((_, ref) => {
  return (
    <div
      id="start-panel-logos"
      ref={ref}
      style={{flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: '125px'}}
    >
      <div style={{position: 'absolute', width: '1060px', height: '2px', backgroundColor: '#e5e5e5', top: '-60px'}}></div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/HuggingFace" target="_blank">
          <img src={huggingFaceLogo} width="60" />
        </a>
      </div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/OpenAI" target="_blank">
          <img src={openAILogo} width="40" style={{marginTop: '7px'}} />
        </a>
      </div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/Cohere" target="_blank">
          <img src={cohereLogo} width="60" style={{marginTop: '1px'}} />
        </a>
      </div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/Azure" target="_blank">
          <img src={azureLogo} width="42" style={{marginTop: '8px'}} />
        </a>
      </div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/AssemblyAI" target="_blank">
          <img src={assemblyAILogo} width="35" style={{marginTop: '9px'}} />
        </a>
      </div>
      <div
        className="start-panel-logo"
        style={{
          textAlign: 'center',
          marginRight: '60px',
          transform: 'scale(1.5)',
          boxShadow: '0 0.2rem 1rem 0 rgba(44, 51, 73, 0.1)',
        }}
      >
        <a href="docs/directConnection/StabilityAI" target="_blank">
          <img src={stabilityAILogo} width="44" style={{marginTop: '6px'}} />
        </a>
      </div>
    </div>
  );
});

function IntroPanel() {
  return (
    <div style={{display: 'none'}}>
      <div
        style={{
          width: '250px',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-10px',
        }}
      >
        <div
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: '10px',
            padding: '10px',
          }}
        >
          <div style={{fontSize: '14px', lineHeight: '20px'}}>"Explain quantum computing in simple terms"</div>
        </div>
        <div
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '15px',
          }}
        >
          <div style={{fontSize: '14px', lineHeight: '20px'}}>Allows user to provide follow-up corrections</div>
        </div>
        <div
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '15px',
          }}
        >
          <div style={{fontSize: '14px', lineHeight: '20px'}}>May occasionally generate incorrect information</div>
        </div>
      </div>
    </div>
  );
}

function Components() {
  return (
    <div id="customize-content">
      <DeepChatBrowser
        demo={true}
        history={[
          {text: 'Hey, how are you?', role: 'user'},
          {text: 'I am doing great, thanks.', role: 'ai'},
          {text: 'What is the meaning of life?', role: 'user'},
          {text: 'Seeking fulfillment and personal growth.', role: 'ai'},
        ]}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
          width: '300px',
        }}
      ></DeepChatBrowser>
      <DeepChatBrowser
        demo={true}
        history={[
          {text: 'Hey, how are you?', role: 'user'},
          {text: 'I am doing great, thanks.', role: 'ai'},
          {text: 'What is the meaning of life?', role: 'user'},
          {text: 'Seeking fulfillment and personal growth.', role: 'ai'},
        ]}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
          width: '300px',
        }}
        messageStyles={{
          default: {
            shared: {bubble: {maxWidth: '100%', backgroundColor: 'unset', marginTop: '10px', marginBottom: '10px'}},
            user: {bubble: {marginLeft: '0px', color: 'black'}},
            ai: {
              outerContainer: {
                backgroundColor: 'rgba(247,247,248)',
                borderTop: '1px solid rgba(0,0,0,.1)',
                borderBottom: '1px solid rgba(0,0,0,.1)',
              },
            },
          },
        }}
        connect={{stream: true}}
        avatars={{default: {styles: {position: 'left'}}}}
        submitButtonStyles={{
          submit: {
            container: {
              default: {
                backgroundColor: '#19c37d',
              },
              hover: {
                backgroundColor: '#0bab69',
              },
              click: {
                backgroundColor: '#068e56',
              },
            },
            svg: {
              content:
                '<?xml version="1.0" encoding="utf-8"?> <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z"> </path> </svg>',
              styles: {
                default: {
                  width: '1.3em',
                  marginTop: '0.15em',
                  filter:
                    'brightness(0) saturate(100%) invert(100%) sepia(28%) saturate(2%) hue-rotate(69deg) brightness(107%) contrast(100%)',
                },
              },
            },
          },
          loading: {
            svg: {
              styles: {
                default: {
                  filter:
                    'brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%) contrast(96%)',
                },
              },
            },
          },
          stop: {
            container: {
              default: {backgroundColor: 'white'},
            },
            svg: {
              styles: {
                default: {
                  filter:
                    'brightness(0) saturate(100%) invert(72%) sepia(0%) saturate(3044%) hue-rotate(322deg) brightness(100%) contrast(96%)',
                },
              },
            },
          },
        }}
        textInput={{placeholder: {text: `What's on your mind?`}}}
      ></DeepChatBrowser>
      <DeepChatBrowser
        demo={true}
        connect={{stream: true}}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
          width: '300px',
        }}
        names={true}
        submitButtonStyles={{
          submit: {
            container: {
              default: {
                backgroundColor: '#547aff',
              },
              hover: {backgroundColor: '#870fdc'},
              click: {backgroundColor: '#6e09b6'},
            },
            text: {
              content: 'Submit',
              styles: {default: {color: 'white'}},
            },
          },
          loading: {
            container: {
              default: {
                backgroundColor: '#a320ff',
              },
              hover: {backgroundColor: '#870fdc'},
              click: {backgroundColor: '#6e09b6'},
            },
            text: {
              content: 'Loading',
              styles: {default: {color: 'white'}},
            },
          },
          stop: {
            container: {
              default: {
                backgroundColor: '#a320ff',
              },
              hover: {backgroundColor: '#870fdc'},
              click: {backgroundColor: '#6e09b6'},
            },
            text: {
              content: 'Stop',
              styles: {default: {color: 'white'}},
            },
          },
        }}
        messageStyles={{default: {user: {bubble: {backgroundColor: '#a320ff'}}}}}
        textInput={{placeholder: {text: 'How may I assist you?'}}}
      >
        <IntroPanel></IntroPanel>
      </DeepChatBrowser>
      <DeepChatBrowser
        demo={true}
        style={{
          borderRadius: '10px',
          boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
          border: '1px solid #ededed',
        }}
        messageStyles={{
          default: {
            user: {
              bubble: {
                maxWidth: '90%',
                backgroundColor: '#e4e6eb',
                marginRight: '10px',
              },
            },
            ai: {
              bubble: {
                maxWidth: '90%',
                marginLeft: '10px',
                paddingTop: '2px',
                paddingBottom: '2px',
              },
            },
          },
          audio: {
            user: {
              bubble: {
                width: '70%',
                backgroundColor: 'white',
              },
            },
            ai: {
              bubble: {
                padding: '0px',
              },
            },
          },
          image: {
            shared: {
              bubble: {
                maxWidth: '70%',
                width: '165px',
                marginTop: '14px',
                padding: '0px',
              },
            },
          },
        }}
        history={[
          {files: [{src: '/img/bird.jpeg', type: 'image'}], role: 'ai'},
          {files: [{src: '/audio/cantinaBand.wav', type: 'audio'}], role: 'ai'},
          {text: '```java\nconsole.log("hello world");\n```', role: 'ai'},
        ]}
        images={true}
        gifs={true}
        audio={true}
        mixedFiles={true}
        dropupStyles={{
          button: {
            position: 'outside-right',
          },
        }}
      ></DeepChatBrowser>
    </div>
  );
}

export default function SocialMedia() {
  return (
    <div
      id="customize"
      style={{
        height: '100vh',
      }}
    >
      <div
        id="customize-sub-header"
        className="feature-sub-header"
        style={{
          marginBottom: '40px',
          marginTop: '40px',
          fontSize: '80px',
        }}
      >
        <img
          style={{width: '70px', marginRight: '15px', marginLeft: '-50px', marginBottom: '-10px'}}
          src="img/deep-chat-title.svg"
        ></img>
        Deep Chat
      </div>
      {/* <div
        id="media-diagonal-padding"
        style={{transform: 'skewY(-3deg)', marginTop: '90px', height: '182px', position: 'absolute', width: '100%'}}
      ></div> */}
      <Components></Components>
      <Logos></Logos>
    </div>
  );
}
