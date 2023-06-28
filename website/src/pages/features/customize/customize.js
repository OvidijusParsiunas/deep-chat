import DeepChatBrowser from '../../../components/table/deepChatBrowser';
import React from 'react';
import './customize.css';

function TriggerOnVisibile(props) {
  const domRef = React.useRef();
  const [isVisible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => setVisible(true), 50);
        observer.unobserve(domRef.current);
      }
    });
    observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={domRef} className={isVisible ? 'customize-content-top' : 'customize-content-bottom'}>
      {props.children}
    </div>
  );
}

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
            backgroundColor: '#f6efff',
            borderRadius: '10px',
            padding: '10px',
          }}
        >
          <div style={{fontSize: '14px', lineHeight: '20px'}}>"Explain quantum computing in simple terms"</div>
        </div>
        <div
          style={{
            backgroundColor: '#f6efff',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '15px',
          }}
        >
          <div style={{fontSize: '14px', lineHeight: '20px'}}>Allows user to provide follow-up corrections</div>
        </div>
        <div
          style={{
            backgroundColor: '#f6efff',
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

export default function Customize() {
  return (
    <div id="customization" style={{marginBottom: '200px'}}>
      <TriggerOnVisibile>
        <div className="feature-sub-header" style={{marginBottom: '80px'}}>
          Customize with no limits
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <DeepChatBrowser
            existingService={{demo: true}}
            initialMessages={[
              {text: 'Hey, how are you?', role: 'user'},
              {text: 'I am doing great, how about you?', role: 'ai'},
              {text: 'What is the meaning of life?', role: 'user'},
              {
                text: 'This completely depends on the person.',
                role: 'ai',
              },
            ]}
            containerStyle={{
              borderRadius: '10px',
              boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
              borderColor: '#ededed',
              marginLeft: '30px',
              marginRight: '30px',
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
            stream={true}
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
                    '<?xml version="1.0" encoding="utf-8"?> <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" id="send" class="icon glyph"> <path d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z" style="fill:#231f20"> </path> </svg>',
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
            existingService={{demo: true}}
            stream={true}
            containerStyle={{
              borderRadius: '10px',
              boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
              borderColor: '#ededed',
              marginLeft: '30px',
              marginRight: '30px',
            }}
            names={true}
            submitButtonStyles={{
              submit: {
                container: {
                  default: {
                    backgroundColor: '#a320ff',
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
            textInput={{placeholder: {text: `How may I assist you?`}}}
          >
            <IntroPanel></IntroPanel>
          </DeepChatBrowser>
          <DeepChatBrowser
            existingService={{demo: true}}
            initialMessages={[
              {text: 'Hey, how are you?', role: 'user'},
              {text: 'I am doing great, how about you?', role: 'ai'},
              {text: 'What is the meaning of life?', role: 'user'},
              {
                text: 'This completely depends on the person.',
                role: 'ai',
              },
            ]}
            containerStyle={{
              borderRadius: '10px',
              boxShadow: '0 .5rem 1rem 0 rgba(44, 51, 73, .1)',
              borderColor: '#ededed',
              marginLeft: '30px',
              marginRight: '30px',
            }}
            messageStyles={{default: {user: {bubble: {backgroundColor: '#ff2020'}}}}}
            submitButtonStyles={{
              submit: {
                svg: {
                  styles: {
                    default: {
                      filter:
                        'brightness(0) saturate(100%) invert(15%) sepia(50%) saturate(6203%) hue-rotate(352deg) brightness(111%) contrast(127%)',
                    },
                  },
                },
              },
            }}
            avatars={{ai: {src: '/img/red-robot-icon.png'}}}
            textInput={{
              styles: {
                container: {
                  border: '1px solid #ffd9d9',
                  backgroundColor: '#fffcfc',
                },
              },
              placeholder: {text: `Insert your question here...`},
            }}
            stream={true}
          ></DeepChatBrowser>
        </div>
      </TriggerOnVisibile>
    </div>
  );
}
