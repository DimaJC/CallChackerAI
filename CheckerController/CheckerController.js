import axios from 'axios';
import FormData from 'form-data';

class checkerRouter {
    async checker(req, res) {
        try {
            const responseAudio = await axios.get(`https://drive.google.com/uc?id=${req.body.file_id}`, { responseType: 'arraybuffer' });
            const formdata = new FormData();

            formdata.append('file', Buffer.from(responseAudio.data), { filename: 'file.mp3' });
            formdata.append('model', 'whisper-1');
            formdata.append('response_format', 'verbose_json');
            formdata.append('temperature', '0.2');
            
            const axiosConfig = {
                headers: {
                    'Authorization': `Bearer ${req.body.api_key_chatGPT}`,
                    ...formdata.getHeaders(),
                },
            };

            const { data: transcriptionsData } = await axios.post('https://api.openai.com/v1/audio/transcriptions', formdata, axiosConfig);

            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = Math.floor(seconds % 60);

                return `${minutes}:${remainingSeconds}`;
              };
            
            const resultString = await transcriptionsData.segments.map(item => {
                const startTime = formatTime(item.start);
                const endTime = formatTime(item.end);

                return `${startTime} - ${endTime}: ${item.text}`;
            }).join('\n');


            const data = {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        "role": "system",
                        "content": req.body.prompt
                    },                                                                                                                                 
                    {
                        "role": "user",
                        "content": resultString
                    }
                ]
            };

            const { data: { choices } } = await axios.post('https://api.openai.com/v1/chat/completions', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.body.api_key_chatGPT}`,
                },
            });

            const calculateThePercentage = (completions) => {
                const analyticsText = req.body.analytics_text;
                const numbers = [];
                let countZero = 0;
                let countOne = 0;

                const pairs = completions.match(/(\d)>(\d)/g);
                pairs.forEach(pair => {
                    const [_, value] = pair.split('>');
                    
                    if (value === '0') {
                        numbers.push(value);
                        countZero++;
                    } else if (value === '1') {
                        numbers.push(value);
                        countOne++;
                    }
                });

                const total = countZero + countOne;

                return {
                    percentage: ((countOne / total) * 100).toFixed(0),
                    analytics_text: analyticsText.map((question, index) => `${question} ${numbers[index]}`).join('\n')
                }
            }

            const calculate = calculateThePercentage(choices[0].message.content);

            return res.json({
                transcriptions: resultString,
                // completions: choices[0].message.content,
                percentage: calculate.percentage,
                analytics_text: calculate.analytics_text
            });
        } catch (e) {
            res.status(400).json({ message: e })
        }
    }
}

export default new checkerRouter()
