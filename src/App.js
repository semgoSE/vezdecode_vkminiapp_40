import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, Div, AdaptivityProvider, AppRoot, Panel, PanelHeader, PanelHeaderContent, Button, List, Placeholder, SimpleCell, IconButton, Avatar } from '@vkontakte/vkui';
import "./App.css"
import '@vkontakte/vkui/dist/vkui.css';
import { Icon24Dismiss } from '@vkontakte/icons';


class App extends React.Component {

	state = {
		activePanel: "bit",
		user: null,
		config: null,
		postition: 0, 
		isLight: false,
		timer: null
	}

	componentDidMount() {
		bridge.send("VKWebAppGetUserInfo").then((user) => {
			console.log(user)
			this.setState({ user })
		})

		bridge.send("VKWebAppFlashGetInfo").then((e) => console.log(e))
	}


	go = e => {
		this.setState({ activePanel : e.currentTarget.dataset.to });
	};


	add = o => {
		const { config, timer } = this.state;
		if(config == null) {
			let arr = [];
			arr.push(o);
			this.setState({ config: arr});
		} else {

			this.setState({ config : [...config, o] } );
		}
		
		if(!timer) {
			let t = setInterval(() => {
				this.run()
			}, 1000)
			this.setState({ timer : t})
		}
	}

	remove = (i) => {
		const { config } = this.state;
		if(config) {
			config.splice(i, 1)
			this.setState({ config })
		}
	}

	
	 run() {
		let { config, isLight, postition } = this.state;
		if(config && config[postition] === 1) {
			if(!isLight) {
				console.log("yes")
				bridge.send("VKWebAppFlashSetLevel", { level: 1 });
				this.setState({ isLight: true })
			}
		} else {
			if(isLight) {
				console.log("no")
				bridge.send("VKWebAppFlashSetLevel", { level: 0 });
				this.setState({ isLight: false })
			}
		}
		this.setState({ postition :  postition+1 === config.length  ? 0 : postition+1 } )
	}	
	render() {
		const { config, activePanel, postition, user } = this.state;
		return (
			<AdaptivityProvider>
				<AppRoot>
					<View activePanel={activePanel}>
						<Panel id="bit">
							<PanelHeader>
								<PanelHeaderContent status="Настраеваемый!" before={<Avatar src={user && user.photo_200} />}>
									Фонарик
								</PanelHeaderContent>
							</PanelHeader>
	
							<Div className="menu">
								<Button mode="commerce" onClick={() => this.add(1)}>Включить</Button>
								<Button style={{ marginLeft: 8 }} onClick={() => this.add(0)}>Выключить</Button>
							</Div>
							{
								config ? 
									<List>
										{config.map((e, i) => (
											<SimpleCell
												disabled
												after={<IconButton onClick={() => {
													this.remove(i)
												}}><Icon24Dismiss /></IconButton>}
												description={postition === i ? "Мы здесь" : ""}
											>{e == 1 ? "горим" : "не горим"}</SimpleCell>
										))}
									</List> :
									<Div>
										<Placeholder>
											Наберите с помощью кнопок комбинацию
										</Placeholder>
									</Div>
							}
						</Panel>
					</View>
				</AppRoot>
			</AdaptivityProvider>
		);
	}
	
}

export default App;
