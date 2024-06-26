import {deleteSubPageItems, saveSubPageItems, useSubPageData} from "../services/entity";
import {Button} from "primereact/button";
import {useFormDialogState} from "../components/dialogs/useFormDialogState";
import {SelectDataTable} from "../components/dataTable/SelectDataTable";
import {ListDialog} from "../components/dialogs/ListDialog";
import {userRequestStatus} from "../components/itemForms/userFormStatusUI";
import {useSubSchema} from "./useSubSchema";
import {useLazyStateHandlers} from "./useLazyStateHandlers";

export function Crosstable({column, data, schema, getFullURL}: {
    data: any,
    column: { field: string, header: string, crosstable: any },
    schema: any
    getFullURL : (arg:string) =>string
}) {
    const {visible, handleShow, handleHide} = useFormDialogState()
    const {
        id,
        listColumns,
        targetSchema,
        existingItems,
        setExistingItems,
        toAddItems,
        setToAddItems
    } = useSubSchema(data, schema, column)
    const {lazyState ,eventHandlers}= useLazyStateHandlers(10)
    const {data: subgridData, mutate: subgridMutate} = useSubPageData(schema.entityName, id, column.field, false, lazyState)

    const {lazyState :excludedLazyState,eventHandlers:excludedEventHandlers}= useLazyStateHandlers(10)
    const {data: excludedSubgridData, mutate: execMutate} = useSubPageData(schema.entityName, id, column.field, true,excludedLazyState)
    const {checkError, Status, confirm} = userRequestStatus(column.field)

    const mutateDate = () => {
        subgridMutate()
        execMutate()

    }

    const handleSave = async () => {
        await saveSubPageItems(schema.entityName, id, column.field, toAddItems)
        handleHide()
        mutateDate()
    }

    const onDelete = async () => {
        confirm('Do you want to delete these item?', async () => {
            const res = await deleteSubPageItems(schema.entityName, id, column.field, existingItems)
            checkError(res, 'Delete Succeed')
            if (!res.err) {
                mutateDate()
            }
        })
    }
    console.log({excludedSubgridData,listColumns})

    return <div className={'card col-12'}>
        <label id={column.field} className="font-bold">
            {column.header}
        </label><br/>
        <Status/>
        <Button outlined label={'Select ' + column.header} onClick={handleShow} size="small"/>
        {' '}
        <Button type={'button'} label={"Delete "} severity="danger" onClick={onDelete} outlined size="small"/>
        <SelectDataTable
            data={subgridData}
            columns={listColumns}
            primaryKey={targetSchema.primaryKey}
            titleAttribute={targetSchema.titleAttribute}
            selectedItems={existingItems}
            setSelectedItems={setExistingItems}
            lazyState={lazyState}
            eventHandlers={eventHandlers}
            getFullURL={getFullURL}
        />
        <ListDialog
            visible={visible}
            handleHide={handleHide}
            handleSave={handleSave}
            header={'Select ' + column.header}>
            <SelectDataTable
                getFullURL={getFullURL}
                data={excludedSubgridData}
                columns={listColumns}
                primaryKey={targetSchema.dataKey}
                titleAttribute={targetSchema.titleAttribute}
                selectedItems={toAddItems}
                setSelectedItems={setToAddItems}
                lazyState={excludedLazyState}
                eventHandlers={excludedEventHandlers}
            />
        </ListDialog>
    </div>
}
