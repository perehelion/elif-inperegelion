const homeUrl = "/";
let allCompanies;
let originalCompanies;


function fetchForDb(data) {
	data = JSON.stringify(data)
	let response = fetch(homeUrl, {
			method: "post",
			body: data
		})
		.then(response => {
			return response;
		})
		.then(res => {
			return res.body
				.getReader()
				.read()
				.then(done => {
					return new TextDecoder("utf-8").decode(done.value);
				});
		})
		.then(res => {
			allCompanies = JSON.parse(res);
			originalCompanies = allCompanies;
			console.log(allCompanies);
			return allCompanies
		});
	return response
}

//THE MAIN BLOCK STARTS HERE, AND IT'S ABOUT 24 CODE LINES
$(() => {
	$('h3').on('click', () => {
		console.log('allo');
		doCalculations()
	})
	let promise = fetchForDb({
			mode: "read"
		})
		.then((allCompanies) => {
			console.log(originalCompanies);

			allCompanies.map((row) => {
				if (row.mother == null || row.mother == undefined || row.mother == 'undefined') {
					row.html = `<li id = '${row.name}'><span class="changeableName btn">${row.name}</span> | own: <span class="changeableEarnings btn">${row.own_earnings}</span> | total: <span class="totalEarnings btn"></span><button class="addButton btn">add</button><button class="delButton btn">del</button><ul id = '${row.name}-childs'></ul></li>`;
					$('#mother-companies').append(row.html)
				} else {
					row.html = `<li id = '${row.name}'><span class="changeableName btn">${row.name}</span> | own: <span class="changeableEarnings btn">${row.own_earnings}</span> | total: <span class="totalEarnings btn"></span><button class="addButton btn">add</button><button class="delButton btn">del</button><ul id = '${row.name}-childs'></ul></li>`;
					row.motherID = `#${row.mother}-childs`
					$(row.motherID).append(row.html);
				}
				row.html = $('#' + row.name)
				row.toDelete = false;
			})
			allCompanies.map((row) => {
				if (row.mother != null && row.mother != undefined && row.mother != 'undefined') {
					if ($('#' + row.name).length) {
						return
					}
					row.html = `<li id = '${row.name}'><span class="changeableName btn">${row.name}</span> | own: <span class="changeableEarnings btn">${row.own_earnings}</span> | total: <span class="totalEarnings btn"></span><button class="addButton btn">add</button><button class="delButton btn">del</button><ul id = '${row.name}-childs'></ul></li>`;
					row.motherID = `#${row.mother}-childs`

					$(row.motherID).append(row.html);
				}
				row.html = $('#' + row.name)
				row.toDelete = false;
			})

			plugInteraction()

		})
	//SAVE CHANGES BUTTON
	$('.btn.save-changes').on('click', (event) => {
		$(event.target).css({
			color: 'grey'
		}).text('Saving Changes... (oftenly it takes much time)').toggleClass('save-changes')

		let promises = []

		//edit edited rows in original db
		allCompanies.map((row) => {
			originalCompanies.map((orRow) => {
				if (orRow.id == row.id) {
					let newName;
					let newEarnings;
					let isEdited = false;
					if (orRow.name != row.name) {
						newName = row.name;
						isEdited = true;
					};
					if (orRow.own_earnings != row.own_earnings) {
						newEarnings = row.own_earnings;
						isedited = true;
					};
					if (isEdited) {
						console.log({
							mode: 'edit',
							id: row.id,
							newName: newName,
							newEarnings: newEarnings,
						});

						promises.push(fetchForDb({
							mode: 'edit',
							arr: {
								id: row.id,
								name: orRow.name,
								own_earnings: orRow.own_earnings,
								new_name: newName,
								new_earnings: newEarnings
							}
						}))
					}
				}
			})
		})

		// add new rows to db table
		allCompanies.map((row) => {
			if (row.id == undefined) {
				console.log({
					mode: 'add',
					id: row.id,
					name: row.name,
					own_earnings: row.own_earnings,
				});
				if (row.mother == 'mother') {
					row.mother = undefined
				}
				promises.push(fetchForDb({
					mode: 'add',
					arr: {
						id: undefined,
						name: row.name,
						own_earnings: row.own_earnings,
						mother: row.mother,
						new_name: undefined,
						new_earnings: undefined
					}
				}))

			}
		})

		// del removed rows from db table
		allCompanies.map((row) => {
			if (row.toDelete) {
				console.log({
					mode: 'delete',
					id: row.id,
					name: row.name,
					own_earnings: row.own_earnings,
				});
				promises.push(fetchForDb({
					mode: 'delete',
					arr: {
						id: undefined,
						name: row.name,
						own_earnings: row.own_earnings,
						mother: row.mother,
						new_name: undefined,
						new_earnings: undefined
					}
				}))

			}
		})

		Promise.all(promises).then(() => {
			$(event.target).css({
				color: 'black'
			}).text('The changes saved, reload to see updated info')
			console.log('end', allCompanies);
		})
	})
})

function plugInteraction(mode) {
	switch (mode) {

		case 'doAdd':
			$('.doAdd').on('click', event => {

				if (Number($(event.currentTarget).siblings('.addedEarnings').val()) != NaN &&
					isUnique($(event.currentTarget).siblings('.addedName').val(), allCompanies)) {
					let temp = {
						name: $(event.currentTarget).siblings('.addedName').val(),
						own_earnings: Number($(event.currentTarget).siblings('.addedEarnings').val()),
						mother: $(event.currentTarget).parent().parent().attr('id').split('-')[0],
					}
					temp.html = `<li id = '${temp.name}'><span class="changeableName btn">${temp.name}</span> | own: <span class="changeableEarnings btn">${temp.own_earnings}</span> | total: <span class="totalEarnings btn"></span><button class="addButton-newby btn">add</button><button class="delButton-newby btn">del</button><ul id = '${temp.name}-childs'></ul></li>`;
					temp.motherID = `#${temp.mother}-childs`
					allCompanies.push(temp);
					$(event.currentTarget).parent().after(temp.html).remove();

					plugInteraction(mode = 'newby');

				} else {
					$(event.currentTarget).siblings().css({
						color: 'red'
					})
				}
			})
			doCalculations()
			break;

		case 'newby':
			$('.delButton-newby').on('click', (event) => {
				allCompanies[findCompanyByName($(event.currentTarget).parent().attr('id'), allCompanies)].toDelete = true
				console.log(allCompanies);
				$(event.currentTarget).parent().remove();
			})

			$('.addButton-newby').on('click', (event) => {
				$(event.currentTarget).siblings('ul').append('<li><input class="addedName" placeholder="new name?"></input><input class="addedEarnings" placeholder="own earnings?"></input><button class="doAdd">+</button></li>')
				plugInteraction(mode = 'doAdd')
			})

			$('.addButton-newby').toggleClass('.addButton-newby .addButton');
			$('.delButton-newby').toggleClass('.delButton-newby .delButton');
			doCalculations()
			break;

		case 'edition':

			$('.changeableEarnings').on('click', (event) => {
				let temp = $(event.currentTarget).text();

				$(event.currentTarget).after('<span><input class="changeOwnEarnings" placeholder="new earnings?"></input><button class="checkMark">✓</button><button class="xMark">x</button></span>');
				$(event.currentTarget).remove();

				$('.checkMark').on('click', (event) => {
					temp = $(event.currentTarget).siblings('input').val();
					if (Number(temp) != NaN) {
						allCompanies[findCompanyByName($(event.currentTarget).parent().parent().attr('id'), allCompanies)].own_earnings = parseInt(temp);
						temp = `<span class="changeableEarnings-newby btn">${temp}`;
						$(event.currentTarget).parent().before(temp);
						$(event.currentTarget).parent().remove()
						plugInteraction('edition-newby')
					} else {
						$(event.currentTarget).css({
							color: 'red'
						})
					}
				})
				$('.xMark').on('click', (event) => {
					temp = `<span class="changeableEarnings btn">${temp}<span> `;
					$(event.currentTarget).parent().before(temp);
					$(event.currentTarget).parent().remove()
				})
			})


			$('.changeableName').on('click', (event) => {
				let temp = $(event.currentTarget).text();

				$(event.currentTarget).after('<span><input class="changeName" placeholder="new name?"></input><button class="checkMark">✓</button><button class="xMark">x</button></span>');
				$(event.currentTarget).remove();

				$('.checkMark').on('click', (event) => {
					temp = $(event.currentTarget).siblings('input').val();
					if (Number(temp) != NaN) {
						allCompanies[findCompanyByName($(event.currentTarget).parent().parent().attr('id'), allCompanies)].own_earnings = parseInt(temp);
						temp = `<span class="changeableName-newby btn">${temp}`;
						$(event.currentTarget).parent().before(temp);
						$(event.currentTarget).parent().remove()
						plugInteraction('edition-newby')
					} else {
						$(event.currentTarget).css({
							color: 'red'
						})
					}
				})
				$('.xMark').on('click', (event) => {
					temp = `<span class="changeableName btn">${temp}<span> `;
					$(event.currentTarget).parent().before(temp);
					$(event.currentTarget).parent().remove()
				})
			})

			plugInteraction('edition-newby')

			break;
		case 'edition-newby':
			$('.changeableEarnings-newby').on('click', (event) => {
				let temp = $(event.currentTarget).text();

				$(event.currentTarget).after('<span><input class="changeOwnEarnings" placeholder="new earnings?"></input><button class="checkMark">✓</button><button class="xMark">x</button></span>');
				$(event.currentTarget).remove();

				$('.checkMark').on('click', (event) => {
					temp = $(event.currentTarget).siblings('input').val();
					if (Number(temp) != NaN) {
						allCompanies[findCompanyByName($(event.currentTarget).parent().parent().attr('id'), allCompanies)].own_earnings = parseInt(temp);
						temp = `<span class="changeableEarnings-newby btn">${temp}`;
						$(event.currentTarget).parent().before(temp);
						$(event.currentTarget).parent().remove()
						plugInteraction('edition-newby')
					} else {
						$(event.currentTarget).css({
							color: 'red'
						})
					}
				})
				$('.xMark').on('click', (event) => {
					temp = `<span class="changeableEarnings btn">${temp}<span> `;
					$(event.currentTarget).parent().before(temp);
					$(event.currentTarget).parent().remove()
				})
			})

			$('.changeableName').on('click', (event) => {
				let temp = $(event.currentTarget).text();

				$(event.currentTarget).after('<span><input class="changeName" placeholder="new name?"></input><button class="checkMark">✓</button><button class="xMark">x</button></span>');
				$(event.currentTarget).remove();

				$('.checkMark').on('click', (event) => {
					temp = $(event.currentTarget).siblings('input').val();
					if (Number(temp) != NaN) {
						allCompanies[findCompanyByName($(event.currentTarget).parent().parent().attr('id'), allCompanies)].name = parseInt(temp);
						temp = `<span class="changeableName-newby btn">${temp}`;
						$(event.currentTarget).parent().before(temp);
						$(event.currentTarget).parent().remove()
						plugInteraction('edition-newby')
					} else {
						$(event.currentTarget).css({
							color: 'red'
						})
					}
				})
				$('.xMark').on('click', (event) => {
					temp = `<span class="changeableName btn">${temp}<span> `;
					$(event.currentTarget).parent().before(temp);
					$(event.currentTarget).parent().remove()
				})
			})

			$('.changeableEarnings-newby').toggleClass('changeableEarnings-newby changeableEarnings');
			$('.changeableName-newby').toggleClass('changeableName-newby changeableName');
			doCalculations()
			break

		default:
			$('.delButton').on('click', (event) => {
				allCompanies[findCompanyByName($(event.currentTarget).parent().attr('id'), allCompanies)].toDelete = true
				$(event.currentTarget).parent().remove();
			})

			$('.addButton').on('click', (event) => {
				$(event.currentTarget).siblings('ul').append('<li><input class="addedName" placeholder="new name?"></input><input class="addedEarnings" placeholder="own earnings?"></input><button class="doAdd btn">+</button></li>')
				plugInteraction(mode = 'doAdd')
			})
			// $(".addButton-main").on('click', (event) => {
			// 	$(event.currentTarget).siblings('ul').append('<li><input class="addedName" placeholder="new name?"></input><input class="addedEarnings" placeholder="own earnings?"></input><button class="doAdd btn">+</button></li>')
			// })
			plugInteraction('edition')
			doCalculations()
			break;
	}
}

function isUnique(newName, companiesList) {
	let temp = true;
	companiesList.map((row) => {
		if (newName == row.name) {
			temp = false
		}
	})
	return temp
}

function findCompanyByName(name, companiesList) {
	let temp;
	companiesList.map((row, index) => {
		if (name == row.name) {
			temp = index;
		}
	})
	return temp;
}

function findCompanyByMother(mother, companiesList) {
	//returns array
	let temp = [];
	companiesList.map((row, index, arr) => {
		if (mother == row.mother) {
			temp.push(arr[index])
		}
	})
	return temp;
}

function calc(company) {
	let res = 0;
	company.childs.forEach(comp => {
		res += calc(comp)
	});
	return res + Number(company.own_earnings)
}

function doCalculations() {
	allCompanies.map((row, index, arr) => {
		row.childs = findCompanyByMother(row.name, arr)
	})
	allCompanies.forEach(company => {
		$(company.html).children('.totalEarnings').html(calc(company))
	});
}